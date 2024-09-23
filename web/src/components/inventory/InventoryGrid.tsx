import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useIntersection } from '../../hooks/useIntersection';
import { selectItemAmount, setItemAmount } from '../../store/inventory';
import { useAppDispatch, useAppSelector } from '../../store';
import { FaInfo } from "react-icons/fa";
import UsefulControls from './UsefulControls';
import Divider from '../utils/Divider';

const PAGE_SIZE = 30;

const InventoryGrid: React.FC<{ inventory: Inventory }> = ({ inventory }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  const itemAmount = useAppSelector(selectItemAmount);
  const dispatch = useAppDispatch();
  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.valueAsNumber =
      isNaN(event.target.valueAsNumber) || event.target.valueAsNumber < 0 ? 0 : Math.floor(event.target.valueAsNumber);
    dispatch(setItemAmount(event.target.valueAsNumber));
  };

  const [infoVisible, setInfoVisible] = useState(false);
  const [visibleCloths, setVisibleCloths] = useState(false);

  return (
    <>
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} />
      <div className="inventory-grid-wrapper" style={{ pointerEvents: isBusy ? 'none' : 'auto', borderTop: '1px solid #32353a', borderLeft: ((inventory.type == 'player') ? '1px solid #32353a' : 'none'), borderBottom: '1px solid #32353a', borderRight: ((inventory.type != 'player') ? '1px solid #32353a' : 'none'), borderTopLeftRadius: ((inventory.type == 'player') ? '0.25rem' : '0'), borderBottomLeftRadius: ((inventory.type == 'player') ? '0.25rem' : '0'), borderTopRightRadius: ((inventory.type != 'player') ? '0.25rem' : '0'), borderBottomRightRadius: ((inventory.type != 'player') ? '0.25rem' : '0'), }}>
        <div>
          <div className="inventory-grid-header-wrapper">
            <p>{inventory.label || "Drop"}</p>
            {(inventory.type == 'player') && (<div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
              <div className='inventory-buttons' style={{ backgroundColor: (infoVisible ? '#2e3035' : '') }} onClick={() => setInfoVisible(!infoVisible)}>
                <FaInfo />
              </div>
              <input
                className="inventory-control-input"
                type="number"
                defaultValue={itemAmount}
                onChange={inputHandler}
                min={0}
              />
            </div>)}
          </div>
        </div>
        <Divider />
        <div className="inventory-grid-container" ref={containerRef}>
          <>
            {inventory.items.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
              <InventorySlot
                key={`${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </>
        </div>
        <WeightBar maxWeight={inventory.maxWeight} weight={weight} percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />
      </div>
    </>
  );
};

export default InventoryGrid;
