using System.ComponentModel.DataAnnotations;

namespace PE.API.Models
{
    public class Movie
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? Genre { get; set; }
        
        [Range(1, 5)]
        public int? Rating { get; set; }
        
        [StringLength(500)]
        public string? PosterUrl { get; set; }
    }
}
