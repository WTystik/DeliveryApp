namespace DeliveryApp.Models
{
    public class Order
    {
        public int Id { get; set; }
        public required string SenderCity { get; set; }
        public required string SenderAddress { get; set; }
        public required string ReceiverCity { get; set; }
        public required string ReceiverAddress { get; set; }
        public decimal Weight { get; set; }
        public DateTime PickupDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}