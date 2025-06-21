namespace DeliveryApp.API.DTOs
{
    public class CreateOrderDto
    {
        public string SenderCity { get; set; }
        public string SenderAddress { get; set; }
        public string ReceiverCity { get; set; }
        public string ReceiverAddress { get; set; }
        public decimal Weight { get; set; }
        public DateTime PickupDate { get; set; }
    }
} 