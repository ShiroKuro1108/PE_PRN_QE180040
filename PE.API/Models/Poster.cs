using System.ComponentModel.DataAnnotations;
namespace PE.API.Models
{
    public class Poster
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? ImageUrl { get; set; }
    }
}
