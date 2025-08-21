import { useState } from 'react';
import { 
  Card, 
  DayStrips, 
  ProgressBar, 
  ProgressCircle, 
  RatingStars 
} from '../../ui';
import type { DayStripStatus } from '../../ui/data/DayStrips/DayStrips';

export default function UIData() {
  const [rating, setRating] = useState(3);
  
  // Примеры данных для DayStrips
  const stripItems = [
    { date: '2025-08-15', status: 'done' as DayStripStatus, rating: 5 },
    { date: '2025-08-16', status: 'done' as DayStripStatus, rating: 4 },
    { date: '2025-08-17', status: 'done' as DayStripStatus, rating: 3 },
    { date: '2025-08-18', status: 'missed' as DayStripStatus, rating: 0 },
    { date: '2025-08-19', status: 'done' as DayStripStatus, rating: 5 },
    { date: '2025-08-20', status: 'current' as DayStripStatus, rating: 0 },
    { date: '2025-08-21', status: 'future' as DayStripStatus, rating: 0 },
    { date: '2025-08-22', status: 'future' as DayStripStatus, rating: 0 },
    { date: '2025-08-23', status: 'future' as DayStripStatus, rating: 0 },
  ];

  const handleStripSelect = (index: number) => {
    console.log('Selected strip:', stripItems[index]);
  };

  return (
    <div className="container">
      <h1>UI Data Components</h1>
      
      <section>
        <h2>DayStrips</h2>
        <Card>
          <h3>Полоски дней (только для просмотра)</h3>
          <DayStrips items={stripItems} />
          
          <h3 style={{ marginTop: '20px' }}>Полоски дней (с выбором)</h3>
          <DayStrips items={stripItems} onSelect={handleStripSelect} />
        </Card>
      </section>

      <section>
        <h2>ProgressBar</h2>
        <Card>
          <div className="progress-demos">
            <div className="progress-item">
              <h3>Обычный прогресс</h3>
              <ProgressBar value={30} />
            </div>
            
            <div className="progress-item">
              <h3>Прогресс с меткой</h3>
              <ProgressBar value={50} label="Прочитано 50%" />
            </div>
            
            <div className="progress-item">
              <h3>Прогресс с разными тонами</h3>
              <ProgressBar value={25} tone="primary" label="Primary (25%)" />
              <div style={{ height: '10px' }} />
              <ProgressBar value={50} tone="success" label="Success (50%)" />
              <div style={{ height: '10px' }} />
              <ProgressBar value={75} tone="danger" label="Danger (75%)" />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2>ProgressCircle</h2>
        <Card>
          <div className="progress-circle-demos">
            <div className="progress-circle-item">
              <ProgressCircle value={25} size={100} />
              <p>Small (25%)</p>
            </div>
            
            <div className="progress-circle-item">
              <ProgressCircle value={50} />
              <p>Default (50%)</p>
            </div>
            
            <div className="progress-circle-item">
              <ProgressCircle value={75} size={200} />
              <p>Large (75%)</p>
            </div>
            
            <div className="progress-circle-item">
              <ProgressCircle value={100} tone="success" />
              <p>Success (100%)</p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2>RatingStars</h2>
        <Card>
          <div className="rating-demos">
            <div className="rating-item">
              <h3>Только для чтения</h3>
              <RatingStars value={4} readOnly />
            </div>
            
            <div className="rating-item">
              <h3>Интерактивный</h3>
              <RatingStars value={rating} onChange={setRating} />
              <p>Выбранный рейтинг: {rating}</p>
            </div>
            
            <div className="rating-item">
              <h3>Разные размеры</h3>
              <div>
                <RatingStars value={3} size="sm" readOnly />
                <p>Маленький</p>
              </div>
              <div>
                <RatingStars value={3} readOnly />
                <p>Обычный</p>
              </div>
              <div>
                <RatingStars value={3} size="lg" readOnly />
                <p>Большой</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <style>{`
        .container {
          padding: 20px;
        }
        section {
          margin-bottom: 30px;
        }
        .progress-demos, .rating-demos {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .progress-circle-demos {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
        }
        .progress-circle-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        h3 {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
