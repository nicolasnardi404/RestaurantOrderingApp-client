import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import formatDateforServer from '../util/formatDateForServer';
import { ITALIAN_LOCALE_CONFIG } from '../util/ItalianLocaleConfigData';
import { UseDataLocal } from '../util/UseDataLocal';
import '../App.css';

function MenuPage() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState({});
  const [error, setError] = useState('');
  const [combinationStatus, setCombinationStatus] = useState('');
  const userName = localStorage.getItem('nome');
  const idUser = localStorage.getItem('idUser');

  UseDataLocal(ITALIAN_LOCALE_CONFIG);

  useEffect(() => {
    if (selectedDay) {
      fetchDishes();
      setCart({}); // Clear selections when date changes
      setCombinationStatus('');
    }
  }, [selectedDay]);

  const fetchDishes = async () => {
    const formDateForServer = formatDateforServer(selectedDay);
    try {
      const response = await fetch(`http://localhost:8080/api/piatto/readByData/${formDateForServer}`);
      const data = await response.json();
      setDishes(data);
      setError('');
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setError('Failed to fetch dishes. Please try again.');
    }
  };

  const getFilteredDishes = (mealType) => {
    return dishes.filter(dish => dish.tipo_piatto === mealType);
  };

  const handleDropdownChange = (mealType, selectedDish) => {
    setCart(prevCart => {
      let newCart;
      if (selectedDish) {
        // Add or update the dish
        newCart = { ...prevCart, [mealType]: selectedDish };
      } else {
        // Remove the dish if it's deselected
        newCart = { ...prevCart };
        delete newCart[mealType];
      }
      checkCombination(newCart);
      return newCart;
    });
  };

  const checkCombination = (currentCart) => {
    const { Primo, Secondo, Contorno, 'Piatto unico': PiattoUnico } = currentCart;    
    
    if (PiattoUnico || (Primo && Secondo && Contorno)) {
      setCombinationStatus('');
    } else {
      let missingItems = [];
      if (!Primo) missingItems.push('Primo');
      if (!Secondo) missingItems.push('Secondo');
      if (!Contorno) missingItems.push('Contorno');
      
      if (missingItems.length === 3) {
        setCombinationStatus('Please select dishes to create a valid combination');   
      } else {
        setCombinationStatus(`Add ${missingItems.join(' or ')} to complete the combination`);
      }
    }
  };

  const isValidCombination = () => {
    const validCombinations = [
      ['Primo', 'Secondo', 'Contorno'],
      ['Primo', 'Piatto unico', 'Contorno'],
      ['Primo', 'Contorno'],
      ['Secondo', 'Contorno'],
      ['Piatto unico', 'Contorno'],
      ['Piatto unico']
    ];

    const selectedTypes = Object.keys(cart).filter(type => cart[type] !== null);
    return validCombinations.some(combination => 
      combination.length === selectedTypes.length && 
      combination.every(type => selectedTypes.includes(type))
    );
  };

  const renderOrderMenu = () => (
    <div className="order-menu">
      {['Primo', 'Secondo', 'Contorno', 'Piatto unico'].map(mealType => (
        <div key={mealType} className="menu-category">
          <h3>{mealType}</h3>
          <Dropdown
            value={cart[mealType]}
            options={getFilteredDishes(mealType)}
            onChange={(e) => handleDropdownChange(mealType, e.value)}
            optionLabel="nome"
            placeholder={`Select ${mealType}`}
            className="w-full md:w-14rem"
            showClear
          />
        </div>
      ))}
    </div>
  );

  const renderFullMenuList = () => (
    <div className="full-menu-list">
      {['Primo', 'Secondo', 'Contorno', 'Piatto unico'].map(mealType => (
        <div key={mealType} className="menu-category">
          <h3>{mealType}</h3>
          <ul>
            {getFilteredDishes(mealType).map(dish => (
              <li key={dish.id}>{dish.nome}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const handleSubmit = () => {
    if (isValidCombination()) {
      // Implement your order submission logic here
      console.log('Order submitted:', cart);
    } else {
      setError('Invalid combination. Please select a valid combination of dishes.');
    }
  };

  return (
    <div className='container-menu'>
      <h1>Welcome, {userName}</h1>
      <div className="date-selection">
        <Calendar 
          value={selectedDay} 
          onChange={(e) => setSelectedDay(e.value)} 
          dateFormat="dd/mm/yy"
          showIcon
          placeholder="Select a date"
        />
      </div>
      
      {selectedDay && (
        <>
          <div className="menu-button-container">
            <Button label="View Full Menu" onClick={() => setShowMenu(true)} className="menu-button" />
          </div>
          {renderOrderMenu()}
          {combinationStatus && <div className="combination-status">{combinationStatus}</div>}
          {error && <div className="error-message">{error}</div>}
          <Button 
            label="Submit Order" 
            onClick={handleSubmit} 
            disabled={!isValidCombination()} 
            className="submit-button"
          />
        </>
      )}

      <Dialog 
        header={`Menu for ${selectedDay ? selectedDay.toLocaleDateString('it-IT') : ''}`}
        visible={showMenu} 
        style={{width: '80vw'}} 
        onHide={() => setShowMenu(false)}
      >
        {renderFullMenuList()}
      </Dialog>
    </div>
  );
}

export default MenuPage;
