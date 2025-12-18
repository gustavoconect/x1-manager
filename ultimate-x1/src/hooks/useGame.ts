import useSWR from 'swr';
import { GameState, PlayerSetupRequest, Lane, PickRequest } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGame() {
    const { data: state, error, mutate } = useSWR<GameState>('/api/state', fetcher, {
        refreshInterval: 1000,
        revalidateOnFocus: true
    });

    const isLoading = !state && !error;

    const setupGame = async (payload: PlayerSetupRequest) => {
        await fetch('/api/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mutate();
    };

    const banLane = async (lane: Lane) => {
        await fetch('/api/ban-lane', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lane }),
        });
        return mutate();
    };

    const drawChampions = async () => {
        await fetch('/api/draw', {
            method: 'POST',
        });
        return mutate();
    };

    const pickChampion = async (payload: PickRequest) => {
        await fetch('/api/pick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mutate();
    };

    return {
        state,
        isLoading,
        isError: error,
        actions: {
            setupGame,
            banLane,
            drawChampions,
            pickChampion
        }
    };
}
