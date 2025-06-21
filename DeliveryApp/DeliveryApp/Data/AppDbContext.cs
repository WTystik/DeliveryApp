using Microsoft.EntityFrameworkCore;
using DeliveryApp.Models;

namespace DeliveryApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Weight).HasColumnType("decimal(18,2)");
                entity.Property(o => o.SenderCity).IsRequired().HasMaxLength(100);
                entity.Property(o => o.SenderAddress).IsRequired().HasMaxLength(200);
                entity.Property(o => o.ReceiverCity).IsRequired().HasMaxLength(100);
                entity.Property(o => o.ReceiverAddress).IsRequired().HasMaxLength(200);
                entity.Property(o => o.PickupDate).HasColumnType("datetime");
                entity.Property(o => o.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("DATETIME('now')");
            });
        }
    }
}