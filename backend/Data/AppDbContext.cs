using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

/// <summary>
/// Database context for the attendance tracking application.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<School> Schools { get; set; }
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure School entity
        modelBuilder.Entity<School>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.HasIndex(e => e.Name)
                .IsUnique();
            
            entity.Property(e => e.Region)
                .HasMaxLength(100);
            
            entity.Property(e => e.CreatedAt)
                .IsRequired();
        });
        
        // Configure AttendanceRecord entity
        modelBuilder.Entity<AttendanceRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Grade)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.StudentCount)
                .IsRequired();
            
            entity.Property(e => e.Date)
                .IsRequired();
            
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            
            // Configure relationship with School
            entity.HasOne(e => e.School)
                .WithMany(s => s.AttendanceRecords)
                .HasForeignKey(e => e.SchoolId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting schools with attendance records
        });
    }
}

