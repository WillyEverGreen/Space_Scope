import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchIssPosition, fetchSpaceWeather, getUpcomingAstronomicalEvents } from './api';

const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('fetchIssPosition', () => {
  it('maps the wheretheiss.at payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      json({ latitude: 12.5, longitude: -45.25, altitude: 421.6, velocity: 27573.4, timestamp: 1700000000 }),
    );
    const iss = await fetchIssPosition();
    expect(iss).toMatchObject({
      message: 'success',
      speed_kmh: 27573,
      altitude_km: 422,
      iss_position: { latitude: '12.5', longitude: '-45.25' },
    });
  });

  it('serves the last good reading, marked stale, when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const iss = await fetchIssPosition();
    expect(iss.message).toBe('stale');
    expect(iss.iss_position.latitude).toBe('12.5');
  });
});

describe('fetchSpaceWeather', () => {
  it('reads Kp, solar wind and the long-channel X-ray flux from the current NOAA formats', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('planetary-k-index')) {
        return json([
          { time_tag: '2026-10-18T21:00:00', Kp: 1.33 },
          { time_tag: '2026-10-19T00:00:00', Kp: 5.67 },
        ]);
      }
      if (url.includes('solar-wind-speed')) return json([{ proton_speed: 612, time_tag: '2026-10-19T03:15:00Z' }]);
      if (url.includes('rtsw_wind_1m')) {
        return Promise.resolve(
          new Response('[{"time_tag": "a", "proton_density": 4.26}, {"time_tag": "b", "proton_dens', { status: 206 }),
        );
      }
      return json([
        { time_tag: '2026-10-19T03:22:00Z', flux: 5e-9, energy: '0.05-0.4nm' },
        { time_tag: '2026-10-19T03:22:00Z', flux: 2e-5, energy: '0.1-0.8nm' },
      ]);
    });
    const weather = await fetchSpaceWeather();
    expect(weather.kpIndex).toMatchObject({ value: 5.67, level: 'storm' });
    expect(weather.solarWind).toMatchObject({ speed: 612, density: 4.3 });
    expect(weather.xrayFlux.fluxClass).toBe('M');
  });
});

describe('getUpcomingAstronomicalEvents', () => {
  it('only returns events that have not finished, in date order, and rolls into next year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-30T12:00:00Z'));
    const events = getUpcomingAstronomicalEvents();
    expect(events.length).toBeGreaterThan(5);
    expect(events.every((e) => (e.endDate ?? e.date) >= '2026-12-30')).toBe(true);
    expect(events.map((e) => e.date)).toEqual([...events.map((e) => e.date)].sort());
    expect(events[0].date.startsWith('2027-')).toBe(true);
    expect(events.some((e) => e.id === 'total-solar-eclipse-2027-08-02')).toBe(true);
  });
});
