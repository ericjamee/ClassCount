using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Region",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "SchoolName",
                table: "AttendanceRecords");

            migrationBuilder.AddColumn<int>(
                name: "SchoolId",
                table: "AttendanceRecords",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Schools",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Region = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schools", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_SchoolId",
                table: "AttendanceRecords",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Schools_Name",
                table: "Schools",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_Schools_SchoolId",
                table: "AttendanceRecords",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_Schools_SchoolId",
                table: "AttendanceRecords");

            migrationBuilder.DropTable(
                name: "Schools");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_SchoolId",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "AttendanceRecords");

            migrationBuilder.AddColumn<string>(
                name: "Region",
                table: "AttendanceRecords",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SchoolName",
                table: "AttendanceRecords",
                type: "TEXT",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
