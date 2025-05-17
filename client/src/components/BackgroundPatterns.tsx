import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function BackgroundPatterns() {
  const { darkMode } = useTheme();
  const [visibleSet, setVisibleSet] = useState(1);
  
  // Cycle through different sets of visible elements
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisibleSet(prev => (prev >= 3 ? 1 : prev + 1));
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Geometric dots pattern - kept but with smaller size */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(${darkMode ? '#FFFFFF' : '#000000'} 1px, transparent 1px), 
                            radial-gradient(${darkMode ? '#FFFFFF' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
      </div>
      
      {/* Diagonal lines - kept but reduced width */}
      <div className="absolute top-0 right-0 bottom-0 w-1/4 opacity-[0.02] dark:opacity-[0.01]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${darkMode ? '#3B82F6' : '#3B82F6'} 0, 
                          ${darkMode ? '#3B82F6' : '#3B82F6'} 1px, 
                          transparent 0, transparent 10px)`,
      }}></div>
      
      {/* SET 1 - visible when visibleSet === 1 */}
      <div className={`transition-opacity duration-1000 ${visibleSet === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[15%] left-[25%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse"></div>
        <div className="absolute top-[30%] left-[40%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[45%] left-[15%] w-4 h-4 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        <div className="absolute top-[10%] left-[65%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute top-[40%] left-[70%] w-5 h-5 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-[55%] left-[85%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3.5s' }}></div>
        
        <div className="absolute top-[20%] left-[50%] w-4 h-4 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[65%] left-[25%] w-10 h-10 rounded-full border-2 border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '5s' }}></div>
      </div>
      
      {/* SET 2 - visible when visibleSet === 2 */}
      <div className={`transition-opacity duration-1000 ${visibleSet === 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[60%] left-[30%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-[75%] left-[45%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3.5s' }}></div>
        <div className="absolute top-[85%] left-[20%] w-5 h-5 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '4.5s' }}></div>
        
        <div className="absolute top-[25%] left-[80%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute top-[70%] left-[75%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[90%] left-[60%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        <div className="absolute top-[50%] left-[55%] w-6 h-6 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '4.5s' }}></div>
        <div className="absolute top-[35%] left-[60%] w-8 h-8 rounded-full border-2 border-primary dark:border-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '6s' }}></div>
      </div>
      
      {/* SET 3 - visible when visibleSet === 3 */}
      <div className={`transition-opacity duration-1000 ${visibleSet === 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[18%] left-[38%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[42%] left-[22%] w-4 h-4 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.5s' }}></div>
        <div className="absolute top-[62%] left-[48%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        
        <div className="absolute top-[15%] left-[72%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[58%] left-[68%] w-5 h-5 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '4.2s' }}></div>
        <div className="absolute top-[80%] left-[38%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.8s' }}></div>
        
        <div className="absolute top-[80%] left-[40%] w-5 h-5 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-[45%] left-[40%] w-7 h-7 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '5.5s' }}></div>
      </div>
      
      {/* Always visible small elements */}
      <div className="absolute top-[33%] left-[33%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-[66%] left-[66%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
    </div>
  );
} 