namespace DeliveryApp.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string SenderCity { get; set; } = string.Empty;
        public string ReceiverCity { get; set; } = string.Empty;
        public decimal Weight { get; set; }
        public DateTime PickupDate { get; set; }
    }
}