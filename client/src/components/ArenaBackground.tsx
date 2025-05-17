import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ArenaBackground() {
  const { darkMode } = useTheme();
  const [cycleIndex, setCycleIndex] = useState(1);
  
  // Cycle through different sets of shapes
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex(prev => (prev >= 4 ? 1 : prev + 1));
    }, 2000); // Change every 2 seconds for more frequent animation
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top decorative arc */}
      <svg 
        className="absolute top-0 right-0 w-full h-[150px] opacity-[0.03] dark:opacity-[0.015]"
        viewBox="0 0 1440 320" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill={darkMode ? '#3B82F6' : '#3B82F6'} 
          fillOpacity="1" 
          d="M0,160L48,138.7C96,117,192,75,288,85.3C384,96,480,160,576,181.3C672,203,768,181,864,160C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        ></path>
      </svg>
      
      {/* Quiz-themed decorative elements - stylized Q and A letters */}
      <div className="absolute top-[15%] left-[5%] text-[200px] font-bold opacity-[0.02] dark:opacity-[0.01] transform -rotate-12">
        <span className="text-primary dark:text-dark-primary">Q</span>
      </div>
      <div className="absolute bottom-[10%] right-[7%] text-[200px] font-bold opacity-[0.02] dark:opacity-[0.01] transform rotate-12">
        <span className="text-secondary dark:text-dark-secondary">A</span>
      </div>
      
      {/* Subtle pulse circles in arena brand colors */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary dark:bg-dark-primary opacity-[0.02] dark:opacity-[0.01] animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-[200px] h-[200px] rounded-full bg-secondary dark:bg-dark-secondary opacity-[0.015] dark:opacity-[0.008] animate-pulse" style={{ animationDuration: '15s' }}></div>
      
      {/* Radial gradient background element */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] opacity-[0.03] dark:opacity-[0.01]" style={{
        background: darkMode 
          ? 'radial-gradient(circle, rgba(30,64,175,0.3) 0%, rgba(0,0,0,0) 70%)'
          : 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)'
      }}></div>
      
      {/* Light grid pattern */}
      <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.008]" style={{
        backgroundImage: `linear-gradient(to right, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), 
                          linear-gradient(to bottom, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Quiz competition themed decorative shapes - trophy silhouette */}
      <svg 
        className="absolute bottom-[5%] left-[10%] w-[100px] h-[100px] opacity-[0.04] dark:opacity-[0.02]"
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={darkMode ? '#F59E0B' : '#F59E0B'}
          d="M5,16L3,5L8.5,12L12,5L15.5,12L21,5L19,16H5M19,19C19,19.55 18.55,20 18,20H6C5.45,20 5,19.55 5,19V18H19V19Z"
        />
      </svg>
      
      {/* Quiz-themed decorative elements - smaller, animated question marks */}
      <div className="absolute top-[15%] left-[5%] text-lg font-bold opacity-[0.05] dark:opacity-[0.03] animate-pulse" style={{ animationDuration: '3s' }}>
        <span className="text-primary dark:text-dark-primary">?</span>
      </div>
      <div className="absolute bottom-[25%] right-[8%] text-lg font-bold opacity-[0.05] dark:opacity-[0.03] animate-pulse" style={{ animationDuration: '4s' }}>
        <span className="text-secondary dark:text-dark-secondary">?</span>
      </div>
      
      {/* Shape set 1 - visible when cycleIndex is 1 */}
      <div className={`transition-opacity duration-500 ${cycleIndex === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[8%] left-[22%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.8s' }}></div>
        <div className="absolute top-[15%] left-[38%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.2s' }}></div>
        <div className="absolute top-[25%] left-[15%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.5s' }}></div>
        
        <div className="absolute top-[12%] left-[68%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute top-[20%] left-[82%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s' }}></div>
        
        <div className="absolute top-[42%] left-[28%] w-4 h-4 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[60%] left-[18%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.7s' }}></div>
        
        <div className="absolute top-[55%] left-[72%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.3s' }}></div>
        <div className="absolute top-[48%] left-[85%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.9s' }}></div>
        
        <div className="absolute top-[75%] left-[25%] w-3 h-3 rounded-full border border-primary dark:border-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute top-[82%] left-[65%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.4s' }}></div>
      </div>
      
      {/* Shape set 2 - visible when cycleIndex is 2 */}
      <div className={`transition-opacity duration-500 ${cycleIndex === 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[10%] left-[30%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.1s' }}></div>
        <div className="absolute top-[5%] left-[52%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.8s' }}></div>
        <div className="absolute top-[18%] left-[45%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.3s' }}></div>
        
        <div className="absolute top-[6%] left-[75%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.6s' }}></div>
        <div className="absolute top-[15%] left-[63%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.2s' }}></div>
        
        <div className="absolute top-[35%] left-[18%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.9s' }}></div>
        <div className="absolute top-[48%] left-[32%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.5s' }}></div>
        
        <div className="absolute top-[42%] left-[62%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-[38%] left-[78%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.7s' }}></div>
        
        <div className="absolute top-[68%] left-[35%] w-3 h-3 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.4s' }}></div>
        <div className="absolute top-[72%] left-[55%] w-4 h-4 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[85%] left-[75%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.1s' }}></div>
      </div>
      
      {/* Shape set 3 - visible when cycleIndex is 3 */}
      <div className={`transition-opacity duration-500 ${cycleIndex === 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[15%] left-[15%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.7s' }}></div>
        <div className="absolute top-[8%] left-[42%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.2s' }}></div>
        <div className="absolute top-[22%] left-[35%] w-4 h-4 rounded-full border border-primary dark:border-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.6s' }}></div>
        
        <div className="absolute top-[18%] left-[58%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.9s' }}></div>
        <div className="absolute top-[5%] left-[85%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.1s' }}></div>
        
        <div className="absolute top-[45%] left-[22%] w-4 h-4 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.4s' }}></div>
        <div className="absolute top-[32%] left-[42%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.8s' }}></div>
        
        <div className="absolute top-[38%] left-[65%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-[48%] left-[78%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '2.3s' }}></div>
        
        <div className="absolute top-[65%] left-[18%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.6s' }}></div>
        <div className="absolute top-[72%] left-[42%] w-4 h-4 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[78%] left-[68%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.1s' }}></div>
      </div>
      
      {/* Shape set 4 - visible when cycleIndex is 4 */}
      <div className={`transition-opacity duration-500 ${cycleIndex === 4 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[12%] left-[25%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '1.9s' }}></div>
        <div className="absolute top-[22%] left-[48%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.1s' }}></div>
        <div className="absolute top-[6%] left-[68%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        
        <div className="absolute top-[32%] left-[12%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.7s' }}></div>
        <div className="absolute top-[42%] left-[42%] w-4 h-4 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute top-[38%] left-[72%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.2s' }}></div>
        
        <div className="absolute top-[58%] left-[28%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '2.3s' }}></div>
        <div className="absolute top-[52%] left-[62%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.8s' }}></div>
        
        <div className="absolute top-[75%] left-[18%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-[82%] left-[38%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.6s' }}></div>
        <div className="absolute top-[68%] left-[58%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '2.4s' }}></div>
        <div className="absolute top-[88%] left-[75%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.2s' }}></div>
      </div>
      
      {/* Always visible elements for continuous animation */}
      <div className="absolute top-[50%] left-[50%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.5s' }}></div>
      <div className="absolute top-[30%] left-[30%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.4s' }}></div>
      <div className="absolute top-[70%] left-[70%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.8s' }}></div>
      <div className="absolute top-[70%] left-[30%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.2s' }}></div>
      <div className="absolute top-[30%] left-[70%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.6s' }}></div>
    </div>
  );
} 