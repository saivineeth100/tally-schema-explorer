import { useState, useEffect } from 'react';
import { useVersion } from '../contexts/VersionContext';

interface ChangeLogIndex {
    added: string[];
    deleted: string[];
    modified: string[];
}

interface ItemHistory {
    added?: string;
    deleted?: string;
}

export const useItemHistory = (type: string) => {
    const { availableVersions } = useVersion();
    const [history, setHistory] = useState<Record<string, ItemHistory>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!availableVersions || availableVersions.length === 0) return;

        const fetchHistory = async () => {
            setLoading(true);
            const historyMap: Record<string, ItemHistory> = {};

            // Sort versions ascending (3.0 -> ... -> 7.0)
            const sortedVersions = [...availableVersions].sort((a, b) => {
                const vA = parseFloat(a.replace(/^v/, ''));
                const vB = parseFloat(b.replace(/^v/, ''));
                return vA - vB;
            });

            const promises = sortedVersions.map(v =>
                fetch(`/Data/${v}/ChangeLog/${type}/${type}.json`)
                    .then(res => {
                        if (!res.ok) return null;
                        return res.json().then(data => ({ ver: v, data: data as ChangeLogIndex }));
                    })
                    .catch(() => null)
            );

            const results = await Promise.all(promises);

            for (const res of results) {
                if (!res) continue;
                const { ver, data } = res;

                // Added
                data.added.forEach(name => {
                    if (!historyMap[name]) historyMap[name] = {};
                    historyMap[name].added = ver;
                });

                // Deleted
                data.deleted.forEach(name => {
                    if (!historyMap[name]) historyMap[name] = {};
                    historyMap[name].deleted = ver;
                });
            }

            setHistory(historyMap);
            setLoading(false);
        };

        fetchHistory();
    }, [availableVersions, type]);

    return { history, loading };
};
