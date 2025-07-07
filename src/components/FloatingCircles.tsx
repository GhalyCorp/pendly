export default function FloatingCircles() {
  return (
    <>
      {/* Circle 1 */}
      <div style={{position: 'absolute', top: '-80px', right: '-120px', width: '320px', height: '320px', pointerEvents: 'none', zIndex: 0}}>
        <div className="circle float-animate-1" style={{width: '100%', height: '100%', opacity: 0.6, background: 'rgba(255, 60, 60, 0.6)'}}></div>
      </div>
      {/* Circle 2 */}
      <div style={{position: 'absolute', bottom: '-100px', left: '-100px', width: '260px', height: '260px', pointerEvents: 'none', zIndex: 0}}>
        <div className="circle float-animate-2" style={{width: '100%', height: '100%', opacity: 0.6, background: 'rgba(255, 60, 60, 0.6)'}}></div>
      </div>
      {/* Circle 3 */}
      <div style={{position: 'absolute', top: '40%', left: '-120px', width: '180px', height: '180px', pointerEvents: 'none', zIndex: 0}}>
        <div className="circle float-animate-3" style={{width: '100%', height: '100%', opacity: 0.4}}></div>
      </div>
      {/* Circle 4 */}
      <div style={{position: 'absolute', top: '-60px', left: '-80px', width: '180px', height: '180px', pointerEvents: 'none', zIndex: 0}}>
        <div className="circle float-animate-2" style={{width: '100%', height: '100%', opacity: 0.6}}></div>
      </div>
      {/* Circle 5 */}
      <div style={{position: 'absolute', bottom: '-80px', right: '-80px', width: '220px', height: '220px', pointerEvents: 'none', zIndex: 0}}>
        <div className="circle float-animate-1" style={{width: '100%', height: '100%', opacity: 0.6}}></div>
      </div>
    </>
  );
}
