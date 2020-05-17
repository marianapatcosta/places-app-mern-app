import React, { useEffect, useRef } from 'react';

import './Map.css';

const Map = ({ className, style, center, zoom })=> {
    /* useRef creates ref to get a pointer/reference in a real DOM node or create variables which survive re-render cycles
    of our components and do not loose their value */
    const mapRef = useRef();
      
    /* useEffect allows that the div holding the ref to this map is rendered first and on after its render, the map is rendered */
    useEffect(() => {
      new window.ol.Map({
        target: mapRef.current.id,
        layers: [
          new window.ol.layer.Tile({
            source: new window.ol.source.OSM()
          })
        ],
        view: new window.ol.View({
          center: window.ol.proj.fromLonLat([center.lng, center.lat]),
          zoom: zoom
        })
      });
    }, [center, zoom]);
  
    return (
        //div has ref prop to point to the map, there is a connection between the map and the div below
      <div
        ref={mapRef}
        className={`map ${className}`}
        style={style}
        id="map"
      ></div>
    );
  };

export default Map;