/**
 * ВАЖНО: теперь адреса разделены на три поля (улица, дом, квартира) для отправителя и получателя.
 * Автоматически собирается адрес для отображения и отправки на сервер.
 * Для даты забора ограничен ввод года 4 цифрами.
 */
import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://localhost:5001/api/orders";

function App() {
  const [orders, setOrders] = useState([]);
  const [cities, setCities] = useState([]);
  const [showSenderCities, setShowSenderCities] = useState(false);
  const [showReceiverCities, setShowReceiverCities] = useState(false);
  const [form, setForm] = useState({
    senderCity: "",
    senderAddress: "ул. ",
    receiverCity: "",
    receiverAddress: "ул. ",
    weight: "",
    pickupDate: ""
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errors, setErrors] = useState({});

  // Получить все заказы
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  // Получить список городов
  useEffect(() => {
    fetch(`${API_URL}/cities`)
      .then((res) => res.json())
      .then(setCities);
  }, []);

  // Автоматическая подстановка шаблона адреса
  const handleAddressInput = (field, value) => {
    // Минимальный шаблон
    let address = value;
    // Если пользователь удалил всё, вернуть шаблон
    if (!address.startsWith("ул. ")) address = "ул. ";
    // Если после "ул. " есть пробел, подставить "д. "
    const afterStreet = address.slice(4);
    if (!address.includes("д. ") && afterStreet.trim().length > 0 && afterStreet.indexOf(" ") !== -1) {
      address = address.replace(/^(ул\.\s+[^ ]+)\s/, "$1 д. ");
    }
    // Если после "д. " есть пробел, подставить "кв. "
    const dIndex = address.indexOf("д. ");
    if (dIndex !== -1) {
      const afterHouse = address.slice(dIndex + 3);
      if (!address.includes("кв. ") && afterHouse.trim().length > 0 && afterHouse.indexOf(" ") !== -1) {
        address = address.replace(/(д\.\s+\d+)\s/, "$1 кв. ");
      }
    }
    setForm(f => ({ ...f, [field]: address }));
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!form.senderCity) newErrors.senderCity = "Выберите город отправителя";
    if (!form.receiverCity) newErrors.receiverCity = "Выберите город получателя";
    
    // Валидация адреса отправителя
    if (!form.senderAddress) {
      newErrors.senderAddress = "Введите адрес отправителя";
    } else if (!/^ул\.\s+[а-яА-ЯёЁ\s\-]+\s+д\.\s+\d+\s+кв\.\s+\d+$/.test(form.senderAddress)) {
      newErrors.senderAddress = "Адрес должен быть в формате: ул. [название улицы] д. [номер дома] кв. [номер квартиры]";
    }
    
    // Валидация адреса получателя
    if (!form.receiverAddress) {
      newErrors.receiverAddress = "Введите адрес получателя";
    } else if (!/^ул\.\s+[а-яА-ЯёЁ\s\-]+\s+д\.\s+\d+\s+кв\.\s+\d+$/.test(form.receiverAddress)) {
      newErrors.receiverAddress = "Адрес должен быть в формате: ул. [название улицы] д. [номер дома] кв. [номер квартиры]";
    }

    if (!form.weight || form.weight <= 0) {
      newErrors.weight = "Введите корректный вес";
    } else if (form.weight > 1000) {
      newErrors.weight = "Вес не может превышать 1000 кг";
    }

    if (!form.pickupDate) {
      newErrors.pickupDate = "Выберите дату забора";
    } else {
      const pickupDate = new Date(form.pickupDate);
      const now = new Date();
      if (pickupDate <= now) {
        newErrors.pickupDate = "Дата забора должна быть в будущем";
      }
      // Строгая проверка на 4 цифры года
      const year = pickupDate.getFullYear();
      if (year < 1000 || year > 9999) {
        newErrors.pickupDate = "Год должен содержать ровно 4 цифры";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Создать заказ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...form,
      weight: Number(form.weight),
      pickupDate: new Date(form.pickupDate).toISOString()
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newOrder = await response.json();
        setOrders([newOrder, ...orders]);
        setForm({
          senderCity: "",
          senderAddress: "ул. ",
          receiverCity: "",
          receiverAddress: "ул. ",
          weight: "",
          pickupDate: ""
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        alert("Ошибка при создании заказа: " + JSON.stringify(errorData));
      }
    } catch (error) {
      alert("Ошибка при создании заказа: " + error.message);
    }
  };

  // Получить детали заказа
  const handleOrderClick = async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (res.ok) {
      setSelectedOrder(await res.json());
    }
  };

  // Выбрать город отправителя
  const selectSenderCity = (city) => {
    setForm({ ...form, senderCity: city });
    setShowSenderCities(false);
  };

  // Выбрать город получателя
  const selectReceiverCity = (city) => {
    setForm({ ...form, receiverCity: city });
    setShowReceiverCities(false);
  };

  // Получить минимальную дату (завтра)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  // Строгое ограничение на ввод даты (только 4 цифры года)
  const handlePickupDateChange = (e) => {
    const value = e.target.value;
    
    // Проверяем, что год содержит ровно 4 цифры
    const year = value.slice(0, 4);
    if (year.length > 4) {
      return; // Не обновляем состояние, если год больше 4 цифр
    }
    
    // Дополнительная проверка на валидность года
    const yearNum = parseInt(year, 10);
    if (yearNum < 1000 || yearNum > 9999) {
      return; // Не обновляем состояние, если год не в диапазоне 1000-9999
    }
    
    setForm({ ...form, pickupDate: value });
  };

  return (
    <div className="container">
      <h1>DeliveryApp</h1>
      <div className="main-content">
        <div className="orders-list">
          <h2>Список заказов</h2>
          <ul>
            {orders.map((order) => (
              <li key={order.id} onClick={() => handleOrderClick(order.id)}>
                Заказ #{order.id} — {order.senderCity} → {order.receiverCity} ({order.weight} кг)
              </li>
            ))}
          </ul>
        </div>
        <div className="order-form">
          <h2>Создать заказ</h2>
          <form onSubmit={handleSubmit}>
            {/* Город отправителя */}
            <div className="form-group">
              <label>Город отправителя:</label>
              <div className="city-selector">
                <input
                  type="text"
                  placeholder="Выберите город отправителя"
                  value={form.senderCity}
                  onChange={e => setForm({ ...form, senderCity: e.target.value })}
                  onFocus={() => setShowSenderCities(true)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowSenderCities(!showSenderCities)}
                  className="city-button"
                >
                  Выбрать город
                </button>
                {showSenderCities && (
                  <div className="cities-dropdown">
                    {cities.map((city) => (
                      <div 
                        key={city} 
                        onClick={() => selectSenderCity(city)}
                        className="city-option"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.senderCity && <span className="error">{errors.senderCity}</span>}
            </div>

            {/* Адрес отправителя */}
            <div className="form-group">
              <label>Адрес отправителя:</label>
              <input
                type="text"
                placeholder="ул. Пушкина д. 5 кв. 12"
                value={form.senderAddress}
                onChange={e => handleAddressInput("senderAddress", e.target.value)}
                required
              />
              {errors.senderAddress && <span className="error">{errors.senderAddress}</span>}
            </div>

            {/* Город получателя */}
            <div className="form-group">
              <label>Город получателя:</label>
              <div className="city-selector">
                <input
                  type="text"
                  placeholder="Выберите город получателя"
                  value={form.receiverCity}
                  onChange={e => setForm({ ...form, receiverCity: e.target.value })}
                  onFocus={() => setShowReceiverCities(true)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowReceiverCities(!showReceiverCities)}
                  className="city-button"
                >
                  Выбрать город
                </button>
                {showReceiverCities && (
                  <div className="cities-dropdown">
                    {cities.map((city) => (
                      <div 
                        key={city} 
                        onClick={() => selectReceiverCity(city)}
                        className="city-option"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.receiverCity && <span className="error">{errors.receiverCity}</span>}
            </div>

            {/* Адрес получателя */}
            <div className="form-group">
              <label>Адрес получателя:</label>
              <input
                type="text"
                placeholder="ул. Ленина д. 10 кв. 5"
                value={form.receiverAddress}
                onChange={e => handleAddressInput("receiverAddress", e.target.value)}
                required
              />
              {errors.receiverAddress && <span className="error">{errors.receiverAddress}</span>}
            </div>

            {/* Вес */}
            <div className="form-group">
              <label>Вес (кг):</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                placeholder="Вес (кг)"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                required
              />
              {errors.weight && <span className="error">{errors.weight}</span>}
            </div>

            {/* Дата забора */}
            <div className="form-group">
              <label>Дата забора:</label>
              <input
                type="datetime-local"
                min={getMinDate()}
                placeholder="Дата забора"
                value={form.pickupDate}
                onChange={handlePickupDateChange}
                required
              />
              {errors.pickupDate && <span className="error">{errors.pickupDate}</span>}
            </div>

            <button type="submit">Создать заказ</button>
          </form>
        </div>
        {selectedOrder && (
          <div className="order-details">
            <h2>Детали заказа #{selectedOrder.id}</h2>
            <p><b>Отправитель:</b> {selectedOrder.senderCity}, {selectedOrder.senderAddress}</p>
            <p><b>Получатель:</b> {selectedOrder.receiverCity}, {selectedOrder.receiverAddress}</p>
            <p><b>Вес:</b> {selectedOrder.weight} кг</p>
            <p><b>Дата забора:</b> {new Date(selectedOrder.pickupDate).toLocaleString()}</p>
            <p><b>Создан:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <button onClick={() => setSelectedOrder(null)}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
