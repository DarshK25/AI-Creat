import React, { useState, useMemo, useEffect } from 'react';
import { generation } from '../../services/generation';

interface AssetFormat {
    id: string;
    name: string;
    platformId: string;
    platformName: string;
    width: number;
    height: number;
}

interface PlatformData {
    platform: string;
    items: AssetFormat[];
}

interface RepurposingGridProps {
    onSelectionChange?: (selectedFormatIds: string[]) => void;
    initialSelection?: string[];
}

const RepurposingGrid: React.FC<RepurposingGridProps> = ({
    onSelectionChange,
    initialSelection = []
}) => {
    const [repurposingData, setRepurposingData] = useState<PlatformData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>(initialSelection);

    //Notifying parent componnt at selection changes
    useEffect(() => {
        onSelectionChange?.(selectedItems);
    }, [selectedItems, onSelectionChange]);

    useEffect(() => {
        const fetchFormats = async () => {
            try {
                setLoading(true);
                const response = await generation.getFormats();

                // Group repurposing formats by platform
                const platformMap = new Map<string, AssetFormat[]>();

                response.repurposing?.forEach((format: AssetFormat) => {
                    if (!platformMap.has(format.platformName)) {
                        platformMap.set(format.platformName, []);
                    }
                    platformMap.get(format.platformName)?.push(format);
                });

                // Convert to array format
                const platformsData: PlatformData[] = Array.from(platformMap.entries()).map(
                    ([platform, items]) => ({
                        platform,
                        items
                    })
                );

                setRepurposingData(platformsData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch formats:', err);
                setError('Failed to load formats. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFormats();
    }, []);

    // Generate a flat list of all possible item IDs for "Select All" functionality
    const allItemIds = useMemo(() =>
        repurposingData.flatMap(p => p.items.map(item => item.id)),
        [repurposingData]
    );

    // Handler to add/remove IDs from the array
    const handleCheckChange = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Platform "Select All" functionality
    const handlePlatformSelectAll = (platformItems: AssetFormat[]) => {
        const platformIds = platformItems.map(item => item.id);
        const areAllChecked = platformIds.every(id => selectedItems.includes(id));

        if (areAllChecked) {
            // Deselect all for this platform by filtering them out
            setSelectedItems(prev => prev.filter(id => !platformIds.includes(id)));
        } else {
            // Select all for this platform by adding them (ensuring no duplicates)
            setSelectedItems(prev => [...new Set([...prev, ...platformIds])]);
        }
    };

    // Global "Select All" functionality
    const handleGlobalSelectAll = () => {
        if (selectedItems.length === allItemIds.length) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(allItemIds); // Select all
        }
    };

    // Check if all items are globally selected
    const isAllGloballySelected = useMemo(() =>
        allItemIds.length > 0 && selectedItems.length === allItemIds.length,
        [selectedItems, allItemIds]
    );

    // Loading state
    if (loading) {
        return (
            <div className="repurposing-container">
                <div className="loading-state">
                    <p>Loading formats...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="repurposing-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (repurposingData.length === 0) {
        return (
            <div className="repurposing-container">
                <div className="empty-state">
                    <p>No formats available. Please contact your administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="repurposing-container">
            <label className="select-all-global-label">
                <input
                    type="checkbox"
                    onChange={handleGlobalSelectAll}
                    checked={isAllGloballySelected}
                />
                <span className="custom-checkbox"></span>
                Select All ({selectedItems.length} of {allItemIds.length} selected)
            </label>

            <div className="repurposing-grid">
                {repurposingData.map(({ platform, items }) => {
                    const platformIds = items.map(item => item.id);
                    const areAllPlatformItemsChecked = platformIds.every(id => selectedItems.includes(id));

                    return (
                        <div className="platform-card" key={platform}>
                            <div className="platform-header">
                                <h3>{platform}</h3>
                                <button
                                    className="platform-select-all"
                                    onClick={() => handlePlatformSelectAll(items)}
                                >
                                    {areAllPlatformItemsChecked ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="platform-item-list">
                                {items.map(item => (
                                    <label key={item.id} className="platform-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleCheckChange(item.id)}
                                        />
                                        <span className="custom-checkbox"></span>
                                        <span>{item.name}</span>
                                        <span className="format-dimensions">
                                            {item.width} × {item.height}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RepurposingGrid;