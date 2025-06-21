using System.ComponentModel.DataAnnotations;

namespace DeliveryApp.DTOs
{
    public class CreateOrderDto
    {
        [Required(ErrorMessage = "Город отправителя обязателен")]
        [StringLength(100, ErrorMessage = "Город отправителя не может быть длиннее 100 символов")]
        public string SenderCity { get; set; } = string.Empty;

        [Required(ErrorMessage = "Адрес отправителя обязателен")]
        [RegularExpression(@"^ул\.\s+[а-яА-ЯёЁ\s\-]+\s+д\.\s+\d+\s+кв\.\s+\d+$", 
            ErrorMessage = "Адрес должен быть в формате: ул. [название улицы] д. [номер дома] кв. [номер квартиры]")]
        public string SenderAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Город получателя обязателен")]
        [StringLength(100, ErrorMessage = "Город получателя не может быть длиннее 100 символов")]
        public string ReceiverCity { get; set; } = string.Empty;

        [Required(ErrorMessage = "Адрес получателя обязателен")]
        [RegularExpression(@"^ул\.\s+[а-яА-ЯёЁ\s\-]+\s+д\.\s+\d+\s+кв\.\s+\d+$", 
            ErrorMessage = "Адрес должен быть в формате: ул. [название улицы] д. [номер дома] кв. [номер квартиры]")]
        public string ReceiverAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Вес обязателен")]
        [Range(0.01, 1000, ErrorMessage = "Вес должен быть от 0.01 до 1000 кг")]
        public double Weight { get; set; }

        [Required(ErrorMessage = "Дата забора обязательна")]
        [FutureDate(ErrorMessage = "Дата забора должна быть в будущем")]
        public DateTime PickupDate { get; set; }
    }

    public class FutureDateAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is DateTime date)
            {
                if (date <= DateTime.Now)
                {
                    return new ValidationResult(ErrorMessage ?? "Дата забора должна быть в будущем");
                }
                // Строгая проверка на 4-значный год
                if (date.Year < 1000 || date.Year > 9999)
                {
                    return new ValidationResult("Год должен содержать ровно 4 цифры");
                }
            }
            return ValidationResult.Success;
        }
    }
}
