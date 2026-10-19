import React from 'react';
import {
  Utensils,
  Bus,
  Coffee,
  Home,
  GraduationCap,
  ShoppingBag,
  Smartphone,
  HeartPulse,
  Film,
  Smile,
  BookOpen,
  Briefcase,
  Laptop,
  PiggyBank,
  Wifi,
  Zap,
  Droplets,
  Dumbbell,
  Receipt,
  HelpCircle,
  Coins,
  Building,
  Sparkles,
} from 'lucide-react';

export function getCategoryIcon(category: string, className = 'w-4 h-4') {
  const norm = (category || '').toLowerCase();

  if (norm.includes('food') || norm.includes('grocer') || norm.includes('lunch') || norm.includes('dinner')) {
    return <Utensils className={className} />;
  }
  if (norm.includes('transport') || norm.includes('bus') || norm.includes('rickshaw') || norm.includes('cng') || norm.includes('uber')) {
    return <Bus className={className} />;
  }
  if (norm.includes('tea') || norm.includes('coffee') || norm.includes('snack') || norm.includes('cha') || norm.includes('tong')) {
    return <Coffee className={className} />;
  }
  if (norm.includes('rent') || norm.includes('mess') || norm.includes('hall') || norm.includes('hostel') || norm.includes('flat')) {
    return <Home className={className} />;
  }
  if (norm.includes('tuition') || norm.includes('semester') || norm.includes('exam') || norm.includes('university') || norm.includes('college')) {
    return <GraduationCap className={className} />;
  }
  if (norm.includes('shop') || norm.includes('cloth') || norm.includes('daraz') || norm.includes('dress')) {
    return <ShoppingBag className={className} />;
  }
  if (norm.includes('mobile') || norm.includes('recharge') || norm.includes('phone') || norm.includes('sim')) {
    return <Smartphone className={className} />;
  }
  if (norm.includes('health') || norm.includes('med') || norm.includes('doctor') || norm.includes('pharma')) {
    return <HeartPulse className={className} />;
  }
  if (norm.includes('entertain') || norm.includes('movie') || norm.includes('game') || norm.includes('outing')) {
    return <Film className={className} />;
  }
  if (norm.includes('personal') || norm.includes('salon') || norm.includes('care')) {
    return <Smile className={className} />;
  }
  if (norm.includes('book') || norm.includes('stationery') || norm.includes('print') || norm.includes('photocopy')) {
    return <BookOpen className={className} />;
  }
  if (norm.includes('wifi') || norm.includes('internet') || norm.includes('broadband')) {
    return <Wifi className={className} />;
  }
  if (norm.includes('electric') || norm.includes('power') || norm.includes('current')) {
    return <Zap className={className} />;
  }
  if (norm.includes('gas') || norm.includes('water')) {
    return <Droplets className={className} />;
  }
  if (norm.includes('gym') || norm.includes('fitness')) {
    return <Dumbbell className={className} />;
  }
  if (norm.includes('freelanc') || norm.includes('job') || norm.includes('salary') || norm.includes('allowance')) {
    return <Briefcase className={className} />;
  }
  if (norm.includes('laptop') || norm.includes('tech') || norm.includes('pc')) {
    return <Laptop className={className} />;
  }
  if (norm.includes('saving') || norm.includes('invest') || norm.includes('fund')) {
    return <PiggyBank className={className} />;
  }
  if (norm.includes('bill')) {
    return <Receipt className={className} />;
  }
  return <HelpCircle className={className} />;
}

export function getPaymentMethodBadge(method: string) {
  const norm = (method || '').toLowerCase();

  if (norm.includes('bkash')) {
    return {
      bg: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/20',
      label: 'bKash',
      dot: 'bg-pink-500',
    };
  }
  if (norm.includes('nagad')) {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20',
      label: 'Nagad',
      dot: 'bg-orange-500',
    };
  }
  if (norm.includes('rocket')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20',
      label: 'Rocket',
      dot: 'bg-purple-500',
    };
  }
  if (norm.includes('bank')) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
      label: 'Bank',
      dot: 'bg-blue-500',
    };
  }
  if (norm.includes('cash')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      label: 'Cash',
      dot: 'bg-emerald-500',
    };
  }
  return {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20',
    label: method || 'Payment',
    dot: 'bg-slate-400',
  };
}
