import React, { useState, useMemo } from 'react';

// Data for all platforms and their items.
const repurposingData = [
    { platform: 'Instagram', items: ['Instagram Post', 'Instagram Story', 'Carousel Posts', 'Shop/Product Images', 'Ad specific sizes'] },
    { platform: 'Youtube', items: ['Youtube Banner', 'Youtube Thumbnail', 'Profile Picture', 'Lorem ipsum', 'Youtube Acme', 'Youtube Lorem'] },
    { platform: 'Facebook', items: ['Facebook Story', 'Facebook Post', 'Carousel Posts', 'Shop/Product Images', 'Ad specific sizes'] },
    { platform: 'Linkedin', items: ['Company Page Logo & Cover', 'Profile Picture', 'Post Images', 'Ad specific sizes', 'Article Link Images'] },
    { platform: 'X', items: ['Profile Picture', 'Header Photo', 'In-Stream Photo', 'Card Images (Website, App)', 'Ad specific sizes'] },
    { platform: 'Pinterest', items: ['Standard Pin', 'Story Pins', 'Idea Pins', 'Lorem ipsum', 'Acme Pin', 'Lorem ipsum Ad'] },
    { platform: 'TikTok', items: ['Profile Picture', 'In-feed Video Thumbnails', 'Consideration for overlay elements', 'Shop/Product Images', 'Ad specific sizes'] },
    { platform: 'Acme Platform', items: ['Company Page Logo & Cover', 'Profile Picture', 'Post Images', 'Ad specific sizes', 'Article Link Images'] },
];

// Generate a flat list of all possible item IDs for "Select All" functionality
const allItemIds = repurposingData.flatMap(p => p.items.map(item => `${p.platform}-${item}`));

const RepurposingGrid: React.FC = () => {
    // --- LOGIC CHANGE 1: State is now an array of selected IDs ---
    const [selectedItems, setSelectedItems] = useState<string[]>([
        'Instagram-Instagram Post',
        'Youtube-Youtube Banner',
        'Facebook-Facebook Story',
    ]);

    // --- LOGIC CHANGE 2: Handler now adds/removes IDs from the array ---
    const handleCheckChange = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // --- LOGIC CHANGE 3: Platform "Select All" now works with the array ---
    const handlePlatformSelectAll = (platform: string, items: string[]) => {
        const platformIds = items.map(item => `${platform}-${item}`);
        const areAllChecked = platformIds.every(id => selectedItems.includes(id));

        if (areAllChecked) {
            // Deselect all for this platform by filtering them out
            setSelectedItems(prev => prev.filter(id => !platformIds.includes(id)));
        } else {
            // Select all for this platform by adding them (ensuring no duplicates)
            setSelectedItems(prev => [...new Set([...prev, ...platformIds])]);
        }
    };
  
    // --- LOGIC CHANGE 4: Global "Select All" now works with the array ---
    const handleGlobalSelectAll = () => {
        if (selectedItems.length === allItemIds.length) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(allItemIds); // Select all
        }
    };

    // --- LOGIC CHANGE 5: Logic to check if all are selected is now a simple length comparison ---
    const isAllGloballySelected = useMemo(() => 
        allItemIds.length > 0 && selectedItems.length === allItemIds.length, 
        [selectedItems]
    );

    return (
        <div className="repurposing-container">
            <label className="select-all-global-label">
                <input type="checkbox" onChange={handleGlobalSelectAll} checked={isAllGloballySelected} />
                <span className="custom-checkbox"></span>
                Select All
            </label>

            <div className="repurposing-grid">
                {repurposingData.map(({ platform, items }) => {
                    const platformIds = items.map(item => `${platform}-${item}`);
                    // --- LOGIC CHANGE 6: Check if a platform's items are all selected ---
                    const areAllPlatformItemsChecked = platformIds.every(id => selectedItems.includes(id));

                    return (
                        <div className="platform-card" key={platform}>
                            <div className="platform-header">
                                <h3>{platform}</h3>
                                <button
                                    className="platform-select-all"
                                    onClick={() => handlePlatformSelectAll(platform, items)}
                                >
                                    {areAllPlatformItemsChecked ? 'Deselects All' : 'Selects All'}
                                </button>
                            </div>
                            <div className="platform-item-list">
                                {items.map(item => {
                                    const id = `${platform}-${item}`;
                                    return (
                                        <label key={id} className="platform-item">
                                            <input
                                                type="checkbox"
                                                // --- LOGIC CHANGE 7: Bind "checked" using array.includes() ---
                                                checked={selectedItems.includes(id)}
                                                onChange={() => handleCheckChange(id)}
                                            />
                                            <span className="custom-checkbox"></span>
                                            <span>{item}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RepurposingGrid;