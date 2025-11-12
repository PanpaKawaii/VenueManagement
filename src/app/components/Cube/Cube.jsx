import { useState } from 'react';
import './Cube.css';

export default function Cube({ color, setRefresh }) {
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    const handleChangeRotation = (axis, value) => {
        setRotation(prev => ({ ...prev, [axis]: parseInt(value) }));
    };
    const text = color == '#dc3545' ? 'Error' : (color == '#007bff' ? 'Loading' : '');
    return (
        <div className='cube-container'>
            <div className='scene-cube'
                style={{ '--color1': color, '--color2': color + '80' }}>
                <div className='cube'
                    style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)` }}>
                    <div className='face f1' onClick={() => setRefresh(p => p + 1)}>{text}</div>
                    <div className='face f2' onClick={() => setRefresh(p => p + 1)}>{text}</div>
                    <div className='face f3' onClick={() => setRefresh(p => p + 1)}>{text}</div>
                    <div className='face f4' onClick={() => setRefresh(p => p + 1)}>{text}</div>
                    <div className='face f5' onClick={() => setRefresh(p => p + 1)}>{text}</div>
                    <div className='face f6' onClick={() => setRefresh(p => p + 1)}>{text}</div>

                    {/* <div className='line line-x'>X</div>
                    <div className='line line-x x-2'>X</div>
                    <div className='line line-y'>Y</div>
                    <div className='line line-y y-2'>Y</div>
                    <div className='line line-z'>Z</div>
                    <div className='line line-z z-2'>Z</div> */}
                </div>
            </div>

            {/* <form className='rotation-form'>
                {['x', 'y', 'z'].map(axis => (
                    <div key={axis} className='slider-group'>
                        <label htmlFor={axis}>{axis.toUpperCase()}: {rotation[axis]}°</label>
                        <input
                            type='range'
                            id={axis}
                            name={axis}
                            min='0'
                            max='360'
                            value={rotation[axis]}
                            onChange={(e) => handleChangeRotation(axis, e.target.value)}
                        />
                    </div>
                ))}
            </form> */}
        </div>
    )
}
