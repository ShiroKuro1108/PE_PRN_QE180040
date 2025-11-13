using Microsoft.EntityFrameworkCore;
using PE.API.Models;
namespace PE.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<PE.API.Models.Movie> Movies { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Movie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Genre).HasMaxLength(100);
                entity.Property(e => e.PosterUrl).HasMaxLength(500);
            });
        }
    }
}
