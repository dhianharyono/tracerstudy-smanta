import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { FaMapMarkerAlt, FaSpinner, FaUniversity } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AlumniData {
  id: string;
  name?: string;
  major?: string;
  graduationYear?: number;
}

interface UniversityData {
  university: string;
  count: number;
  type?: 'negeri' | 'swasta' | 'kedinasan';
  alumni: AlumniData[];
}

interface GeocodedUniversity extends UniversityData {
  lat?: number;
  lng?: number;
}

function MapBounds({ universities }: { universities: GeocodedUniversity[] }) {
  const map = useMap();

  useEffect(() => {
    const validUniversities = universities.filter(
      (u) => u.lat !== undefined && u.lng !== undefined
    );

    if (validUniversities.length > 0) {
      const bounds = L.latLngBounds(
        validUniversities.map((u) => [u.lat!, u.lng!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([-2.5489, 118.0149], 5);
    }
  }, [map, universities]);

  return null;
}

const InteractiveAlumniMap = ({ apiEndpoint }: { apiEndpoint: string }) => {
  const [universities, setUniversities] = useState<GeocodedUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);

  const getMarkerIcon = (count: number, type?: string) => {
    const size = Math.min(30 + count * 2, 50);
    let color = '#3388ff';

    if (type === 'negeri') {
      color = '#10b981';
    } else if (type === 'swasta') {
      color = '#8b5cf6';
    } else if (type === 'kedinasan') {
      color = '#ec4899';
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(12, size * 0.4)}px;
      ">${count}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const geocodeUniversity = async (
    universityName: string
  ): Promise<{ lat: number; lng: number } | null> => {
    if (!universityName) return null;

    const generateQueries = (name: string) => {
      const variations = [
        `${name}, Indonesia`,
        name,
      ];

      // Handle Surakarta/Solo interchangeable names
      if (name.toLowerCase().includes('surakarta')) {
        variations.push(name.replace(/surakarta/gi, 'Solo') + ', Indonesia');
      } else if (name.toLowerCase().includes('solo')) {
        variations.push(name.replace(/\bsolo\b/gi, 'Surakarta') + ', Indonesia');
      }

      // Case: Swap Universitas <-> University
      if (name.toLowerCase().includes('universitas')) {
        variations.push(name.replace(/universitas/gi, 'University') + ', Indonesia');
      } else if (name.toLowerCase().includes('university')) {
        variations.push(name.replace(/university/gi, 'Universitas') + ', Indonesia');
      }

      // Case: Swap Institut <-> Institute
      if (name.toLowerCase().includes('institut')) {
        variations.push(name.replace(/institut/gi, 'Institute') + ', Indonesia');
      }

      // Special case: Poltekkes Kemenkes (often indexed without 'Kemenkes')
      if (name.toLowerCase().includes('poltekkes') || name.toLowerCase().includes('kemenkes')) {
        const simple = name
          .replace(/kemenkes/gi, '')
          .replace(/kementerian kesehatan/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        variations.push(simple + ', Indonesia');
        variations.push(simple.replace(/poltekkes/gi, 'Politeknik Kesehatan') + ', Indonesia');
      }

      // Case: Handle Common Abbreviations
      let expanded = name
        .replace(/\bpoltekkes\b/gi, 'Politeknik Kesehatan')
        .replace(/\bkemenkes\b/gi, 'Kementerian Kesehatan')
        .replace(/\bstikes\b/gi, 'Sekolah Tinggi Ilmu Kesehatan');

      if (expanded !== name) {
        variations.push(`${expanded}, Indonesia`);
      }

      // Case: Shorten the query (take first and last words - often Type and City)
      const words = name.split(' ');
      if (words.length > 2) {
        variations.push(`${words[0]} ${words[words.length - 1]}, Indonesia`);
      }

      return [...new Set(variations)];
    };

    const uniqueQueries = generateQueries(universityName);

    for (const query of uniqueQueries) {
      try {
        const encodedQuery = encodeURIComponent(query);
        // Use viewbox for Indonesia bias
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1&viewbox=95.0,-11.0,141.0,6.0`,
          {
            headers: {
              'User-Agent': 'TracerStudyApp/1.0',
            },
          }
        );

        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }

        // Respect rate limits if we have more queries to try
        if (uniqueQueries.indexOf(query) < uniqueQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Geocoding failed for attempt: ${query}`, error);
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<UniversityData[]>(apiEndpoint);
        const universityData = response.data;

        if (universityData.length === 0) {
          setLoading(false);
          return;
        }

        const cachedCoordsJson = localStorage.getItem('university_coords_cache');
        const coordsCache = cachedCoordsJson ? JSON.parse(cachedCoordsJson) : {};
        const newCache = { ...coordsCache };
        let cacheUpdated = false;

        const geocodedUniversities: GeocodedUniversity[] = [];
        const total = universityData.length;

        for (let i = 0; i < universityData.length; i++) {
          const university = universityData[i];
          setGeocodingProgress(((i + 1) / total) * 100);

          let coords = coordsCache[university.university];

          if (!coords) {
            coords = await geocodeUniversity(university.university);
            if (coords) {
              newCache[university.university] = coords;
              cacheUpdated = true;
            }

            // Respect Nominatim's rate limit only if we actually made a request
            if (i < universityData.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          geocodedUniversities.push({
            ...university,
            lat: coords?.lat,
            lng: coords?.lng,
          });

          // Update state incrementally every 3 universities or at the end
          if ((i + 1) % 3 === 0 || i === universityData.length - 1) {
            setUniversities([...geocodedUniversities]);
          }
        }

        if (cacheUpdated) {
          localStorage.setItem('university_coords_cache', JSON.stringify(newCache));
        }
      } catch (error) {
        console.error('Error fetching alumni map data:', error);
      } finally {
        setLoading(false);
        setGeocodingProgress(0);
      }
    };

    fetchData();
  }, [apiEndpoint]);

  const validUniversities = useMemo(
    () =>
      universities.filter((u) => u.lat !== undefined && u.lng !== undefined),
    [universities]
  );

  const getUniversityTypeLabel = (type?: string) => {
    switch (type) {
      case 'negeri':
        return 'PTN';
      case 'swasta':
        return 'PTS';
      case 'kedinasan':
        return 'Kedinasan';
      default:
        return 'Universitas';
    }
  };

  if (loading) {
    return (
      <div className='card h-[400px] md:h-[500px]'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px',
          }}
        >
          <FaSpinner className='spinner' style={{ fontSize: '32px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            {geocodingProgress > 0
              ? `Memuat lokasi universitas... ${Math.round(geocodingProgress)}%`
              : 'Memuat data alumni...'}
          </p>
        </div>
      </div>
    );
  }

  // Removed the empty state return to always show the map container

  return (
    <div className='card h-auto md:h-[500px]'>
      <h2
        className='text-lg md:text-xl'
        style={{
          marginBottom: '24px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <FaMapMarkerAlt />
        <span>Persebaran Alumni</span>
      </h2>
      <div className='relative w-full h-[300px] md:h-[290px] rounded-lg overflow-hidden border border-[var(--border-color)]'>
        <MapContainer
          center={[-2.5489, 118.0149]}
          zoom={5}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {validUniversities.length > 0 && (
            <>
              <MapBounds universities={validUniversities} />
              {validUniversities.map((university, index) => (
                <Marker
                  key={index}
                  position={[university.lat!, university.lng!]}
                  icon={getMarkerIcon(university.count, university.type)}
                >
                  <Popup>
                    <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <FaUniversity style={{ color: 'var(--primary)' }} />
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {university.university}
                        </h3>
                      </div>
                      <div
                        style={{
                          marginBottom: '8px',
                          padding: '8px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '6px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <strong>Jenis:</strong>{' '}
                          {getUniversityTypeLabel(university.type)}
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <strong>Jumlah Alumni:</strong> {university.count}
                        </div>
                      </div>
                      {university.alumni && university.alumni.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: 'var(--text-primary)',
                              marginBottom: '8px',
                            }}
                          >
                            Daftar Alumni:
                          </div>
                          <div
                            style={{
                              maxHeight: '200px',
                              overflowY: 'auto',
                              fontSize: '12px',
                            }}
                          >
                            {university.alumni.slice(0, 10).map((alumni, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '6px',
                                  marginBottom: '4px',
                                  background: 'var(--bg-card)',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                  }}
                                >
                                  {alumni.name || 'N/A'}
                                </div>
                                {alumni.major && (
                                  <div
                                    style={{
                                      color: 'var(--text-secondary)',
                                      fontSize: '11px',
                                    }}
                                  >
                                    {alumni.major}
                                  </div>
                                )}
                                {alumni.graduationYear && (
                                  <div
                                    style={{
                                      color: 'var(--text-tertiary)',
                                      fontSize: '11px',
                                    }}
                                  >
                                    Lulus: {alumni.graduationYear}
                                  </div>
                                )}
                              </div>
                            ))}
                            {university.alumni.length > 10 && (
                              <div
                                style={{
                                  textAlign: 'center',
                                  color: 'var(--text-tertiary)',
                                  fontSize: '11px',
                                  marginTop: '8px',
                                }}
                              >
                                +{university.alumni.length - 10} alumni lainnya
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>
        {validUniversities.length === 0 && !loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'var(--bg-card)',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              pointerEvents: 'none',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FaMapMarkerAlt style={{ fontSize: '24px', color: 'var(--text-tertiary)' }} />
            <span>Belum ada data universitas untuk ditampilkan</span>
          </div>
        )}
      </div>
      <div
        className='text-xs'
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>PTN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#8b5cf6',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>PTS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ec4899',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>Kedinasan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#3388ff',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>Lainnya</span>
          </div>
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
          }}
        >
          Ukuran marker menunjukkan jumlah alumni di universitas tersebut
        </div>
      </div>
    </div>
  );
};

export default InteractiveAlumniMap;
