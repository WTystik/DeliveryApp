using DeliveryApp.Data;
using DeliveryApp.DTOs;
using DeliveryApp.Models;
using DeliveryApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace DeliveryApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository;
            _logger = logger;
        }

        [HttpGet("cities")]
        public ActionResult<IEnumerable<string>> GetCities()
        {
            var cities = new List<string>
            {
                "Москва",
                "Санкт-Петербург", 
                "Новосибирск",
                "Екатеринбург",
                "Казань",
                "Нижний Новгород",
                "Челябинск",
                "Самара",
                "Уфа",
                "Ростов-на-Дону",
                "Краснодар",
                "Пермь",
                "Воронеж",
                "Волгоград",
                "Красноярск",
                "Саратов",
                "Тюмень",
                "Тольятти",
                "Ижевск",
                "Барнаул"
            };
            
            return Ok(cities);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDetailDto>> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid order data received");
                return BadRequest(ModelState);
            }

            try
            {
                var order = new Order
                {
                    SenderCity = orderDto.SenderCity,
                    SenderAddress = orderDto.SenderAddress,
                    ReceiverCity = orderDto.ReceiverCity,
                    ReceiverAddress = orderDto.ReceiverAddress,
                    Weight = (decimal)orderDto.Weight,
                    PickupDate = orderDto.PickupDate
                };

                var createdOrder = await _orderRepository.CreateOrderAsync(order);

                return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.Id }, MapToDetailDto(createdOrder));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            try
            {
                var orders = await _orderRepository.GetAllOrdersAsync();
                return Ok(orders.Select(MapToDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailDto>> GetOrder([Range(1, int.MaxValue)] int id)
        {
            try
            {
                var order = await _orderRepository.GetOrderByIdAsync(id);

                if (order == null)
                {
                    _logger.LogWarning("Order with ID {OrderId} not found", id);
                    return NotFound();
                }

                return Ok(MapToDetailDto(order));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order with ID: {OrderId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        private static OrderDto MapToDto(Order order) => new()
        {
            Id = order.Id,
            SenderCity = order.SenderCity,
            ReceiverCity = order.ReceiverCity,
            Weight = order.Weight,
            PickupDate = order.PickupDate
        };

        private static OrderDetailDto MapToDetailDto(Order order) => new()
        {
            Id = order.Id,
            SenderCity = order.SenderCity,
            SenderAddress = order.SenderAddress,
            ReceiverCity = order.ReceiverCity,
            ReceiverAddress = order.ReceiverAddress,
            Weight = order.Weight,
            PickupDate = order.PickupDate,
            CreatedAt = order.CreatedAt
        };
    }
}