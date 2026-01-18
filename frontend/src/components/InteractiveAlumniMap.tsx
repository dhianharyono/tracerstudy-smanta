import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { FaMapMarkerAlt, FaSpinner, FaUniversity } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Custom styles for Leaflet popup close button
const popupStyles = `
  .leaflet-popup-close-button {
    right: 8px !important;
    top: 8px !important;
    width: 24px !important;
    height: 24px !important;
    font-size: 20px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: var(--text-secondary) !important;
    background: var(--bg-secondary) !important;
    border-radius: 6px !important;
    border: 1px solid var(--border-color) !important;
    transition: all 0.2s ease !important;
  }
  
  .leaflet-popup-close-button:hover {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    transform: scale(1.05) !important;
  }
`;

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
      (u) => u.lat !== undefined && u.lng !== undefined,
    );

    if (validUniversities.length > 0) {
      const bounds = L.latLngBounds(
        validUniversities.map((u) => [u.lat!, u.lng!]),
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
    universityName: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    if (!universityName) return null;

    const generateQueries = (name: string) => {
      const variations = [`${name}, Indonesia`, name];

      // Handle Surakarta/Solo interchangeable names
      if (name.toLowerCase().includes('surakarta')) {
        variations.push(name.replace(/surakarta/gi, 'Solo') + ', Indonesia');
      } else if (name.toLowerCase().includes('solo')) {
        variations.push(
          name.replace(/\bsolo\b/gi, 'Surakarta') + ', Indonesia',
        );
      }

      // Case: Swap Universitas <-> University
      if (name.toLowerCase().includes('universitas')) {
        variations.push(
          name.replace(/universitas/gi, 'University') + ', Indonesia',
        );
      } else if (name.toLowerCase().includes('university')) {
        variations.push(
          name.replace(/university/gi, 'Universitas') + ', Indonesia',
        );
      }

      // Case: Swap Institut <-> Institute
      if (name.toLowerCase().includes('institut')) {
        variations.push(
          name.replace(/institut/gi, 'Institute') + ', Indonesia',
        );
      }

      // Special case: Poltekkes Kemenkes (often indexed without 'Kemenkes')
      if (
        name.toLowerCase().includes('poltekkes') ||
        name.toLowerCase().includes('kemenkes')
      ) {
        const simple = name
          .replace(/kemenkes/gi, '')
          .replace(/kementerian kesehatan/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        variations.push(simple + ', Indonesia');
        variations.push(
          simple.replace(/poltekkes/gi, 'Politeknik Kesehatan') + ', Indonesia',
        );
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
          },
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
          await new Promise((resolve) => setTimeout(resolve, 300));
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

        const cachedCoordsJson = localStorage.getItem(
          'university_coords_cache',
        );
        const coordsCache = cachedCoordsJson
          ? JSON.parse(cachedCoordsJson)
          : {};
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
          localStorage.setItem(
            'university_coords_cache',
            JSON.stringify(newCache),
          );
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
    [universities],
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
      <div className='card h-[400px] md:h-[700px]'>
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
          <p
            style={{ color: 'var(--text-secondary)' }}
            className=' text-xs md:text-sm'
          >
            {geocodingProgress > 0
              ? `Memuat lokasi universitas... ${Math.round(geocodingProgress)}%`
              : 'Memuat data alumni...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='card h-auto md:h-[700px]'>
      {/* Inject custom styles for popup close button */}
      <style>{popupStyles}</style>
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
      <div className='relative w-full h-[500px] md:h-[490px] rounded-lg overflow-hidden border border-[var(--border-color)]'>
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
                    <div
                      style={{
                        minWidth: '240px',
                        maxWidth: '320px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Header Section */}
                      <div
                        style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderBottom: '1px solid var(--border-color)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                          }}
                        >
                          <div
                            style={{
                              padding: '8px',
                              background: 'var(--primary)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              marginTop: '2px',
                            }}
                          >
                            <FaUniversity />
                          </div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '15px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              lineHeight: '1.4',
                            }}
                          >
                            {university.university}
                          </h3>
                        </div>
                      </div>

                      <div style={{ padding: '16px' }}>
                        {/* Summary Info */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginBottom: '16px',
                          }}
                        >
                          <div
                            style={{
                              background: 'var(--bg-secondary)',
                              padding: '10px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                                fontWeight: '600',
                              }}
                            >
                              Jenis
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: 'var(--text-primary)',
                                fontWeight: '600',
                              }}
                            >
                              {getUniversityTypeLabel(university.type)}
                            </div>
                          </div>
                          <div
                            style={{
                              background: 'var(--bg-secondary)',
                              padding: '10px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                                fontWeight: '600',
                              }}
                            >
                              Alumni
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: 'var(--text-primary)',
                                fontWeight: '600',
                              }}
                            >
                              {university.count}
                            </div>
                          </div>
                        </div>

                        {/* Alumni List */}
                        {university.alumni && university.alumni.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>Daftar Alumni</span>
                              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                {university.alumni.length} Total
                              </span>
                            </div>
                            <div
                              style={{
                                maxHeight: '180px',
                                overflowY: 'auto',
                                paddingRight: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                              }}
                              className='custom-scrollbar'
                            >
                              {university.alumni
                                .slice(0, 10)
                                .map((alumni, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '8px 10px',
                                      background: 'var(--bg-secondary)',
                                      borderRadius: '8px',
                                      border: '1px solid var(--border-color)',
                                      fontSize: '12px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '2px',
                                      }}
                                    >
                                      {alumni.name || 'N/A'}
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: 'var(--text-tertiary)',
                                          fontSize: '11px',
                                        }}
                                      >
                                        {alumni.major || 'Program Studi N/A'}
                                      </span>
                                      {alumni.graduationYear && (
                                        <span
                                          style={{
                                            color: 'var(--primary-light)',
                                            fontSize: '10px',
                                            background:
                                              'rgba(37, 99, 235, 0.1)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: '500',
                                          }}
                                        >
                                          '
                                          {String(alumni.graduationYear).slice(
                                            -2,
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              {university.alumni.length > 10 && (
                                <div
                                  style={{
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '11px',
                                    padding: '8px 0',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  +{university.alumni.length - 10} alumni
                                  lainnya
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
            <FaMapMarkerAlt
              style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}
            />
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
