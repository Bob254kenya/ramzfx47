import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  TrendingUp, TrendingDown, Activity, Target, Shield,
  Play, Pause, StopCircle, RefreshCw, Wallet, Database,
  Brain, BarChart3, Zap, Clock, Trophy, AlertCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Trade {
  id: string;
  time: Date;
  type: 'EVEN' | 'ODD' | 'OVER' | 'UNDER';
  stake: number;
  result: 'won' | 'lost' | 'pending';
  profit: number;
  actualDigit?: number;
  actualValue?: number;
}

interface BotConfig {
  enabled: boolean;
  mode: 'EVEN_ODD' | 'OVER_UNDER' | 'BOTH';
  stake: number;
  strategy: 'MARTINGALE' | 'ANTI_MARTINGALE' | 'FLAT' | 'DALEMBERT';
  baseStake: number;
  maxStake: number;
  stopLoss: number;
  takeProfit: number;
  maxTrades: number;
  delayBetweenTrades: number; // milliseconds
}

interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  currentStreak: number;
  bestStreak: number;
  worstStreak: number;
  currentStake: number;
}

// ============================================
// MOCK DATA GENERATOR (Replace with real API)
// ============================================

class MarketSimulator {
  private lastPrice: number = 100;
  private volatility: number = 0.02;
  
  getNextTick(): { price: number; digit: number; isEven: boolean; isOver: boolean } {
    // Random walk with slight bias
    const change = (Math.random() - 0.5) * this.volatility;
    this.lastPrice = Math.max(1, this.lastPrice + change);
    
    const digit = Math.floor(this.lastPrice % 10);
    const isEven = digit % 2 === 0;
    const isOver = digit > 4;
    
    return {
      price: this.lastPrice,
      digit,
      isEven,
      isOver
    };
  }
  
  setVolatility(vol: number) {
    this.volatility = vol;
  }
}

// ============================================
// STRATEGY CALCULATIONS
// ============================================

const calculateNextStake = (
  strategy: BotConfig['strategy'],
  currentStake: number,
  baseStake: number,
  lastResult: 'won' | 'lost' | null,
  consecutiveLosses: number,
  maxStake: number
): number => {
  switch (strategy) {
    case 'MARTINGALE':
      // Double after loss
      if (lastResult === 'lost') {
        return Math.min(currentStake * 2, maxStake);
      }
      return baseStake;
      
    case 'ANTI_MARTINGALE':
      // Increase after win, reset after loss
      if (lastResult === 'won') {
        return Math.min(currentStake * 1.5, maxStake);
      }
      return baseStake;
      
    case 'DALEMBERT':
      // Increase by 1 unit after loss, decrease by 1 after win
      if (lastResult === 'lost') {
        return Math.min(currentStake + baseStake, maxStake);
      } else if (lastResult === 'won') {
        return Math.max(baseStake, currentStake - baseStake);
      }
      return baseStake;
      
    case 'FLAT':
    default:
      return baseStake;
  }
};

const predictNextOutcome = (
  mode: BotConfig['mode'],
  recentDigits: number[]
): { prediction: string; confidence: number } => {
  if (recentDigits.length < 10) {
    return { prediction: mode === 'EVEN_ODD' ? 'EVEN' : 'OVER', confidence: 50 };
  }
  
  const last10 = recentDigits.slice(-10);
  
  if (mode === 'EVEN_ODD') {
    const evenCount = last10.filter(d => d % 2 === 0).length;
    const evenPercentage = (evenCount / 10) * 100;
    
    // Mean reversion - if too many evens, bet odd
    if (evenPercentage > 60) {
      return { prediction: 'ODD', confidence: evenPercentage };
    } else if (evenPercentage < 40) {
      return { prediction: 'EVEN', confidence: 100 - evenPercentage };
    } else {
      return { prediction: Math.random() > 0.5 ? 'EVEN' : 'ODD', confidence: 50 };
    }
  } else {
    const overCount = last10.filter(d => d > 4).length;
    const overPercentage = (overCount / 10) * 100;
    
    if (overPercentage > 60) {
      return { prediction: 'UNDER', confidence: overPercentage };
    } else if (overPercentage < 40) {
      return { prediction: 'OVER', confidence: 100 - overPercentage };
    } else {
      return { prediction: Math.random() > 0.5 ? 'OVER' : 'UNDER', confidence: 50 };
    }
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TradingBot() {
  // ============================================
  // STATE
  // ============================================
  
  const [isConnected, setIsConnected] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [marketSimulator] = useState(() => new MarketSimulator());
  
  const [botConfig, setBotConfig] = useState<BotConfig>({
    enabled: false,
    mode: 'BOTH',
    stake: 10,
    strategy: 'FLAT',
    baseStake: 10,
    maxStake: 100,
    stopLoss: 100,
    takeProfit: 200,
    maxTrades: 100,
    delayBetweenTrades: 1000
  });
  
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalProfit: 0,
    currentStreak: 0,
    bestStreak: 0,
    worstStreak: 0,
    currentStake: 10
  });
  
  const [recentDigits, setRecentDigits] = useState<number[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [isBotPaused, setIsBotPaused] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<{ type: string; confidence: number } | null>(null);
  
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const runningRef = useRef(false);
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const updateStats = useCallback((newTrade: Trade) => {
    setStats(prev => {
      const newWins = prev.wins + (newTrade.result === 'won' ? 1 : 0);
      const newLosses = prev.losses + (newTrade.result === 'lost' ? 1 : 0);
      const newTotalTrades = prev.totalTrades + 1;
      const newWinRate = newTotalTrades > 0 ? (newWins / newTotalTrades) * 100 : 0;
      const newTotalProfit = prev.totalProfit + newTrade.profit;
      
      let newStreak = prev.currentStreak;
      if (newTrade.result === 'won') {
        newStreak = newStreak > 0 ? newStreak + 1 : 1;
      } else {
        newStreak = newStreak < 0 ? newStreak - 1 : -1;
      }
      
      return {
        ...prev,
        totalTrades: newTotalTrades,
        wins: newWins,
        losses: newLosses,
        winRate: newWinRate,
        totalProfit: newTotalProfit,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, Math.abs(newStreak)),
        worstStreak: Math.min(prev.worstStreak, newStreak)
      };
    });
  }, []);
  
  const executeTrade = useCallback(async (prediction: string) => {
    const currentStake = stats.currentStake;
    
    // Check if we can afford the trade
    if (currentStake > balance) {
      toast.error(`Insufficient balance for stake $${currentStake}`);
      return null;
    }
    
    // Simulate market tick
    const tick = marketSimulator.getNextTick();
    
    // Determine if trade won
    let won = false;
    if (prediction === 'EVEN') won = tick.isEven;
    else if (prediction === 'ODD') won = !tick.isEven;
    else if (prediction === 'OVER') won = tick.isOver;
    else if (prediction === 'UNDER') won = !tick.isOver;
    
    // Calculate profit (assuming 95% payout for simplicity)
    const profit = won ? currentStake * 0.95 : -currentStake;
    
    const trade: Trade = {
      id: Date.now().toString(),
      time: new Date(),
      type: prediction as any,
      stake: currentStake,
      result: won ? 'won' : 'lost',
      profit,
      actualDigit: tick.digit,
      actualValue: tick.price
    };
    
    // Update balance
    setBalance(prev => prev + profit);
    
    // Update recent digits
    setRecentDigits(prev => [...prev.slice(-49), tick.digit]);
    
    // Add to recent trades
    setRecentTrades(prev => [trade, ...prev].slice(0, 20));
    
    // Update stats
    updateStats(trade);
    
    // Calculate next stake based on strategy
    const nextStake = calculateNextStake(
      botConfig.strategy,
      stats.currentStake,
      botConfig.baseStake,
      trade.result,
      trade.result === 'lost' ? Math.abs(stats.currentStreak) : 0,
      botConfig.maxStake
    );
    
    setStats(prev => ({ ...prev, currentStake: nextStake }));
    
    return trade;
  }, [balance, marketSimulator, stats.currentStake, stats.currentStreak, botConfig.strategy, botConfig.baseStake, botConfig.maxStake, updateStats]);
  
  const runBotIteration = useCallback(async () => {
    if (!isBotRunning || isBotPaused) return;
    
    // Check stop loss / take profit
    if (stats.totalProfit <= -botConfig.stopLoss) {
      toast.error(`Stop loss triggered! Total loss: $${Math.abs(stats.totalProfit).toFixed(2)}`);
      stopBot();
      return;
    }
    
    if (stats.totalProfit >= botConfig.takeProfit) {
      toast.success(`Take profit triggered! Total profit: $${stats.totalProfit.toFixed(2)}`);
      stopBot();
      return;
    }
    
    // Check max trades
    if (stats.totalTrades >= botConfig.maxTrades) {
      toast.info(`Max trades (${botConfig.maxTrades}) reached`);
      stopBot();
      return;
    }
    
    // Get prediction
    let prediction: string | null = null;
    let confidence = 50;
    
    if (botConfig.mode === 'EVEN_ODD') {
      const result = predictNextOutcome('EVEN_ODD', recentDigits);
      prediction = result.prediction;
      confidence = result.confidence;
    } else if (botConfig.mode === 'OVER_UNDER') {
      const result = predictNextOutcome('OVER_UNDER', recentDigits);
      prediction = result.prediction;
      confidence = result.confidence;
    } else {
      // BOTH mode - alternate or choose best
      const evenOdd = predictNextOutcome('EVEN_ODD', recentDigits);
      const overUnder = predictNextOutcome('OVER_UNDER', recentDigits);
      
      // Choose the one with higher confidence
      if (evenOdd.confidence > overUnder.confidence) {
        prediction = evenOdd.prediction;
        confidence = evenOdd.confidence;
      } else {
        prediction = overUnder.prediction;
        confidence = overUnder.confidence;
      }
    }
    
    setCurrentPrediction({ type: prediction!, confidence });
    
    // Execute trade
    const trade = await executeTrade(prediction!);
    
    if (trade) {
      toast(
        `${trade.result === 'won' ? '✅ WIN' : '❌ LOSS'} | ${trade.type} | $${trade.stake} → ${trade.profit > 0 ? '+' : ''}$${trade.profit.toFixed(2)}`,
        { duration: 2000 }
      );
    }
    
    // Wait before next trade
    setTimeout(() => {
      if (runningRef.current && !isBotPaused) {
        runBotIteration();
      }
    }, botConfig.delayBetweenTrades);
  }, [isBotRunning, isBotPaused, stats, botConfig, recentDigits, executeTrade, stopBot]);
  
  const startBot = useCallback(() => {
    if (stats.totalProfit <= -botConfig.stopLoss) {
      toast.error(`Cannot start: Stop loss would be immediately triggered`);
      return;
    }
    
    setIsBotRunning(true);
    setIsBotPaused(false);
    runningRef.current = true;
    toast.success('Bot started');
    runBotIteration();
  }, [stats.totalProfit, botConfig.stopLoss, runBotIteration]);
  
  const pauseBot = useCallback(() => {
    setIsBotPaused(true);
    toast.info('Bot paused');
  }, []);
  
  const resumeBot = useCallback(() => {
    setIsBotPaused(false);
    toast.success('Bot resumed');
    runBotIteration();
  }, [runBotIteration]);
  
  const stopBot = useCallback(() => {
    setIsBotRunning(false);
    setIsBotPaused(false);
    runningRef.current = false;
    setCurrentPrediction(null);
    toast.info('Bot stopped');
  }, []);
  
  const resetBot = useCallback(() => {
    stopBot();
    setBalance(1000);
    setStats({
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalProfit: 0,
      currentStreak: 0,
      bestStreak: 0,
      worstStreak: 0,
      currentStake: botConfig.baseStake
    });
    setRecentDigits([]);
    setRecentTrades([]);
    setCurrentPrediction(null);
    toast.info('Bot reset');
  }, [stopBot, botConfig.baseStake]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
      }
      runningRef.current = false;
    };
  }, []);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI Trading Bot
                  </h1>
                  <p className="text-sm text-gray-400">Even/Odd • Over/Under Strategy Automation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Account Balance</div>
                  <div className={`text-2xl font-bold ${balance >= 1000 ? 'text-green-400' : 'text-red-400'}`}>
                    ${balance.toFixed(2)}
                  </div>
                </div>
                <Badge className={`${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                  {isConnected ? '● Connected' : '○ Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bot Configuration Panel */}
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Bot Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Mode Selection */}
              <div>
                <label className="text-sm text-gray-300 block mb-2">Trading Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EVEN_ODD', 'OVER_UNDER', 'BOTH'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setBotConfig(prev => ({ ...prev, mode }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        botConfig.mode === mode
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {mode === 'EVEN_ODD' ? 'Even/Odd' : mode === 'OVER_UNDER' ? 'Over/Under' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Strategy Selection */}
              <div>
                <label className="text-sm text-gray-300 block mb-2">Stake Strategy</label>
                <Select
                  value={botConfig.strategy}
                  onValueChange={(v: any) => setBotConfig(prev => ({ ...prev, strategy: v }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat (Fixed Stake)</SelectItem>
                    <SelectItem value="MARTINGALE">Martingale (Double on Loss)</SelectItem>
                    <SelectItem value="ANTI_MARTINGALE">Anti-Martingale (Increase on Win)</SelectItem>
                    <SelectItem value="DALEMBERT">D'Alembert (+1 on Loss, -1 on Win)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Stake Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Base Stake ($)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={botConfig.baseStake}
                    onChange={(e) => setBotConfig(prev => ({ 
                      ...prev, 
                      baseStake: parseFloat(e.target.value),
                      stake: parseFloat(e.target.value)
                    }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Max Stake ($)</label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={botConfig.maxStake}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, maxStake: parseFloat(e.target.value) }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              
              {/* Risk Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Stop Loss ($)</label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={botConfig.stopLoss}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Take Profit ($)</label>
                  <Input
                    type="number"
                    min="10"
                    max="1000"
                    value={botConfig.takeProfit}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              
              {/* Additional Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Max Trades</label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={botConfig.maxTrades}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, maxTrades: parseInt(e.target.value) }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Delay (ms)</label>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={botConfig.delayBetweenTrades}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, delayBetweenTrades: parseInt(e.target.value) }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              
              {/* Bot Controls */}
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {!isBotRunning ? (
                    <Button onClick={startBot} className="col-span-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Play className="w-4 h-4 mr-2" /> Start Bot
                    </Button>
                  ) : (
                    <>
                      <Button onClick={pauseBot} variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                        <Pause className="w-4 h-4 mr-2" /> Pause
                      </Button>
                      <Button onClick={resumeBot} variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                        <Play className="w-4 h-4 mr-2" /> Resume
                      </Button>
                      <Button onClick={stopBot} variant="destructive">
                        <StopCircle className="w-4 h-4 mr-2" /> Stop
                      </Button>
                    </>
                  )}
                </div>
                
                <Button onClick={resetBot} variant="outline" className="w-full border-white/10 text-gray-400 hover:bg-white/5">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset Bot
                </Button>
              </div>
              
              {/* Current Status */}
              {isBotRunning && currentPrediction && (
                <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="text-xs text-gray-400 mb-1">Current Prediction</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-400">{currentPrediction.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Confidence</span>
                      <span className="text-sm font-mono text-purple-400">{currentPrediction.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={currentPrediction.confidence} className="h-1 mt-2" />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Stats Panel */}
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Performance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalTrades}</div>
                  <div className="text-xs text-gray-400">Total Trades</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                  <div className="text-xs text-gray-400">Losses</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Total P/L</div>
                </div>
              </div>
              
              {/* Win Rate Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="font-mono text-purple-400">{stats.winRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.winRate} className="h-2" />
              </div>
              
              {/* Streak Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Current Streak
                  </div>
                  <div className={`text-xl font-bold mt-1 ${stats.currentStreak > 0 ? 'text-green-400' : stats.currentStreak < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {stats.currentStreak > 0 ? `+${stats.currentStreak}` : stats.currentStreak}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Target className="w-4 h-4 text-purple-400" />
                    Current Stake
                  </div>
                  <div className="text-xl font-bold text-purple-400 mt-1">
                    ${stats.currentStake.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Best/Worst Records */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="text-xs text-green-400">Best Streak</div>
                  <div className="text-lg font-bold text-green-400">+{stats.bestStreak}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="text-xs text-red-400">Worst Streak</div>
                  <div className="text-lg font-bold text-red-400">{stats.worstStreak}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Live Feed Panel */}
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Live Trade Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Recent Digits */}
              <div>
                <div className="text-sm text-gray-300 mb-2">Recent Digits</div>
                <div className="flex flex-wrap gap-1">
                  {recentDigits.slice(-20).map((digit, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                        digit % 2 === 0
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      }`}
                    >
                      {digit}
                    </div>
                  ))}
                  {recentDigits.length === 0 && (
                    <div className="text-xs text-gray-500">Waiting for data...</div>
                  )}
                </div>
              </div>
              
              {/* Recent Trades */}
              <div>
                <div className="text-sm text-gray-300 mb-2">Recent Trades</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className={`p-3 rounded-lg ${
                        trade.result === 'won'
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${trade.result === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                            {trade.result.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm font-bold text-white">{trade.type}</span>
                        </div>
                        <div className={`font-mono text-sm font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                        <span>Stake: ${trade.stake.toFixed(2)}</span>
                        <span>Digit: {trade.actualDigit}</span>
                        <span>{trade.time.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  {recentTrades.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No trades yet. Start the bot to begin.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Strategy Explanation */}
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Strategy Notes</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• {botConfig.strategy} stake management active</p>
                  <p>• Bot uses mean reversion for predictions</p>
                  <p>• Stop Loss: ${botConfig.stopLoss} | Take Profit: ${botConfig.takeProfit}</p>
                  <p className="text-yellow-500/70 text-[10px] mt-2">
                    ⚠️ Educational purposes only. No strategy guarantees profits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
