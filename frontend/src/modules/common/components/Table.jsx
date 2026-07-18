// src/modules/common/components/Table.jsx
import React from 'react';

const Table = () => {
    const teamBars = {
        // Equipo A (azul)
        left: {
            gk: { left: '5%', positions: [50] },
            df: { left: '13%', positions: [20, 50, 80] },
            fw: { left: '72%', positions: [20, 50, 80] }
        },
        // Equipo B (rojo)
        right: {
            gk: { left: '95%', positions: [50] },
            df: { left: '87%', positions: [20, 50, 80] },
            fw: { left: '28%', positions: [20, 50, 80] }
        },
        // Barras centrales (medios)
        midfield: {
            left: { left: '42%', positions: [20, 50, 80] },
            right: { left: '58%', positions: [20, 50, 80] }
        }
    };

    const PlayerBar = ({ left, positions, color }) => (
        <div 
            className="position-absolute" 
            style={{ 
                left: left, 
                top: '0', 
                height: '100%', 
                width: '6px',
                backgroundColor: 'rgba(180, 180, 185, 0.25)',
                borderRadius: '3px',
                transform: 'translateX(-50%)'
            }}
        >
            {positions.map((top, i) => (
                <div
                    key={i}
                    className="position-absolute rounded-circle"
                    style={{
                        top: `${top}%`,
                        left: '50%',
                        width: '12px',
                        height: '12px',
                        backgroundColor: color,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: i === 1 ? `0 0 16px ${color}60` : '0 1px 3px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.4)'
                    }}
                />
            ))}
        </div>
    );

    return (
        <div 
            className="position-relative w-100 rounded-4 shadow-sm border" 
            style={{ 
                height: '400px', 
                backgroundColor: '#e8e8ea', 
                borderColor: '#c8c8cc', 
                overflow: 'hidden' 
            }}
        >
            {/* Línea central */}
            <div className="position-absolute h-100 border-start" 
                style={{ left: '50%', borderColor: '#c8c8cc', borderStyle: 'dashed' }} />
            
            {/* Círculo central */}
            <div className="position-absolute rounded-circle border" 
                style={{ 
                    width: '90px', 
                    height: '90px', 
                    top: 'calc(50% - 45px)', 
                    left: 'calc(50% - 45px)', 
                    borderColor: '#c8c8cc' 
                }} />

            {/* Área de gol izquierda */}
            <div className="position-absolute" 
                style={{ 
                    width: '28px', 
                    height: '140px', 
                    top: 'calc(50% - 70px)', 
                    left: 0, 
                    border: '2px solid #c8c8cc',
                    borderLeft: 'none',
                    borderRadius: '0 4px 4px 0' 
                }} />
            
            {/* Área de gol derecha */}
            <div className="position-absolute" 
                style={{ 
                    width: '28px', 
                    height: '140px', 
                    top: 'calc(50% - 70px)', 
                    right: 0, 
                    border: '2px solid #c8c8cc',
                    borderRight: 'none',
                    borderRadius: '4px 0 0 4px' 
                }} />

            {/* Puntos de penalti */}
            <div className="position-absolute rounded-circle" 
                style={{ width: '6px', height: '6px', backgroundColor: '#c8c8cc', top: '50%', left: '18%' }} />
            <div className="position-absolute rounded-circle" 
                style={{ width: '6px', height: '6px', backgroundColor: '#c8c8cc', top: '50%', right: '18%' }} />

            {/* Círculo de penalti izquierdo */}
            <div className="position-absolute rounded-circle border" 
                style={{ 
                    width: '50px', 
                    height: '50px', 
                    top: 'calc(50% - 25px)', 
                    left: '12%', 
                    borderColor: '#c8c8cc',
                    borderStyle: 'dashed'
                }} />
            
            {/* Círculo de penalti derecho */}
            <div className="position-absolute rounded-circle border" 
                style={{ 
                    width: '50px', 
                    height: '50px', 
                    top: 'calc(50% - 25px)', 
                    right: '12%', 
                    borderColor: '#c8c8cc',
                    borderStyle: 'dashed'
                }} />

            {/* Orden de barras de izquierda a derecha: */}
            {/* 1. Portero A (azul) */}
            <PlayerBar 
                left={teamBars.left.gk.left} 
                positions={teamBars.left.gk.positions} 
                color="#0071e3" 
            />
            
            {/* 2. Defensas A (azul) */}
            <PlayerBar 
                left={teamBars.left.df.left} 
                positions={teamBars.left.df.positions} 
                color="#0071e3" 
            />
            
            {/* 3. Delanteros B (rojo) */}
            <PlayerBar 
                left={teamBars.right.fw.left} 
                positions={teamBars.right.fw.positions} 
                color="#ff453a" 
            />
            
            {/* 4. Medios A (azul) */}
            <PlayerBar 
                left={teamBars.midfield.left.left} 
                positions={teamBars.midfield.left.positions} 
                color="#0071e3" 
            />
            
            {/* 5. Medios B (rojo) */}
            <PlayerBar 
                left={teamBars.midfield.right.left} 
                positions={teamBars.midfield.right.positions} 
                color="#ff453a" 
            />
            
            {/* 6. Delanteros A (azul) */}
            <PlayerBar 
                left={teamBars.left.fw.left} 
                positions={teamBars.left.fw.positions} 
                color="#0071e3" 
            />
            
            {/* 7. Defensas B (rojo) */}
            <PlayerBar 
                left={teamBars.right.df.left} 
                positions={teamBars.right.df.positions} 
                color="#ff453a" 
            />
            
            {/* 8. Portero B (rojo) */}
            <PlayerBar 
                left={teamBars.right.gk.left} 
                positions={teamBars.right.gk.positions} 
                color="#ff453a" 
            />

            {/* Pelota */}
            <div className="position-absolute rounded-circle" 
                style={{ 
                    width: '14px', 
                    height: '14px', 
                    top: 'calc(50% - 7px)', 
                    left: 'calc(50% - 7px)', 
                    zIndex: 5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #d2d2d7',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }} />
        </div>
    );
};

export default Table;