import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function HomepageBackground() {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeShapes, setActiveShapes] = useState(1);
  
  useEffect(() => {
    // Delay the appearance for a smoother transition after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    // Animate shape sets every 2.5 seconds
    const shapesInterval = setInterval(() => {
      setActiveShapes(prev => (prev >= 5 ? 1 : prev + 1));
    }, 2500);
    
    return () => {
      clearTimeout(timer);
      clearInterval(shapesInterval);
    };
  }, []);
  
  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Grid pattern with varying intensity - smaller size */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.01]">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), 
                            linear-gradient(to right, ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      
      {/* Shape set 1 */}
      <div className={`transition-opacity duration-700 ${activeShapes === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[8%] left-[22%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-[25%] left-[12%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.2s' }}></div>
        <div className="absolute top-[40%] left-[35%] w-4 h-4 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[65%] left-[18%] w-3 h-3 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute top-[88%] left-[28%] w-5 h-5 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3.5s' }}></div>
        
        <div className="absolute top-[15%] left-[75%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[45%] left-[85%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute top-[72%] left-[66%] w-5 h-5 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '3.2s' }}></div>
      </div>
      
      {/* Shape set 2 */}
      <div className={`transition-opacity duration-700 ${activeShapes === 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[12%] left-[35%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.6s' }}></div>
        <div className="absolute top-[30%] left-[15%] w-3 h-3 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3.3s' }}></div>
        <div className="absolute top-[52%] left-[25%] w-4 h-4 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-[78%] left-[32%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3s' }}></div>
        
        <div className="absolute top-[18%] left-[65%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.4s' }}></div>
        <div className="absolute top-[38%] left-[80%] w-5 h-5 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '3.1s' }}></div>
        <div className="absolute top-[62%] left-[70%] w-4 h-4 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[85%] left-[62%] w-3 h-3 rounded-full border border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.5s' }}></div>
      </div>
      
      {/* Shape set 3 */}
      <div className={`transition-opacity duration-700 ${activeShapes === 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[5%] left-[42%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.3s' }}></div>
        <div className="absolute top-[22%] left-[28%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3.2s' }}></div>
        <div className="absolute top-[45%] left-[18%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute top-[68%] left-[38%] w-5 h-5 rounded-full border-2 border-secondary dark:border-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-[90%] left-[22%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.5s' }}></div>
        
        <div className="absolute top-[8%] left-[62%] w-4 h-4 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[35%] left-[75%] w-3 h-3 rounded-md bg-primary dark:bg-dark-primary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[55%] left-[68%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.4s' }}></div>
        <div className="absolute top-[82%] left-[78%] w-4 h-4 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.2s' }}></div>
      </div>
      
      {/* Shape set 4 */}
      <div className={`transition-opacity duration-700 ${activeShapes === 4 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[15%] left-[18%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.2s' }}></div>
        <div className="absolute top-[32%] left-[32%] w-5 h-5 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.4s' }}></div>
        <div className="absolute top-[58%] left-[15%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '2.9s' }}></div>
        <div className="absolute top-[75%] left-[25%] w-4 h-4 rounded-full border border-primary dark:border-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.6s' }}></div>
        
        <div className="absolute top-[12%] left-[78%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.6s' }}></div>
        <div className="absolute top-[28%] left-[62%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-[48%] left-[72%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute top-[72%] left-[82%] w-5 h-5 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '3.3s' }}></div>
      </div>
      
      {/* Shape set 5 */}
      <div className={`transition-opacity duration-700 ${activeShapes === 5 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[20%] left-[25%] w-4 h-4 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute top-[42%] left-[12%] w-3 h-3 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3.1s' }}></div>
        <div className="absolute top-[65%] left-[28%] w-6 h-6 rounded-full border-2 border-primary dark:border-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '4.2s' }}></div>
        <div className="absolute top-[80%] left-[15%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '2.4s' }}></div>
        
        <div className="absolute top-[22%] left-[72%] w-5 h-5 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-pulse" style={{ animationDuration: '3.5s' }}></div>
        <div className="absolute top-[48%] left-[85%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.7s' }}></div>
        <div className="absolute top-[62%] left-[65%] w-4 h-4 rounded-md bg-secondary dark:bg-dark-secondary opacity-8 dark:opacity-4 animate-pulse" style={{ animationDuration: '3.3s' }}></div>
        <div className="absolute top-[88%] left-[78%] w-3 h-3 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '2.9s' }}></div>
      </div>
      
      {/* Always visible elements for continuous animation */}
      <div className="absolute top-[50%] left-[50%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.5s' }}></div>
      <div className="absolute top-[25%] left-[50%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}></div>
      <div className="absolute top-[75%] left-[50%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.7s', animationDelay: '0.7s' }}></div>
      <div className="absolute top-[50%] left-[25%] w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.3s' }}></div>
      <div className="absolute top-[50%] left-[75%] w-2 h-2 rounded-full bg-primary dark:bg-dark-primary opacity-10 dark:opacity-5 animate-ping" style={{ animationDuration: '1.9s', animationDelay: '0.9s' }}></div>
    </div>
  );
} 