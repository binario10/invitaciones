import { useState, useEffect } from 'react';
import './Countdown.css';

export default function Countdown({ targetDate }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    }
    return {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((difference / 1000 / 60) % 60),
      segundos: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Días', value: timeLeft.dias },
    { label: 'Horas', value: timeLeft.horas },
    { label: 'Minutos', value: timeLeft.minutos },
    { label: 'Segundos', value: timeLeft.segundos },
  ];

  return (
    <section id="cuenta-regresiva" className="countdown-wrapper">
      <div className="section-container">
        <span className="section-subtitle">Faltan tan solo</span>
        <h2 className="section-title">Para el gran día</h2>
        <div className="countdown-grid">
          {units.map((unit) => (
            <div key={unit.label} className="countdown-box">
              <span className="countdown-number">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="countdown-label">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
