# 🎭 Trick Drive Matrix Generator

A web application that generates optimal seating arrangements for magic association performance nights, solving the Social Golfer Problem with practical constraints.

## What is Trick Drive?

Trick Drive is a format where magicians gather to share and teach tricks to each other. Participants rotate between tables in rounds, ensuring everyone gets to perform for and learn from everyone else.

## Features

- **Flexible Scheduling**: Generate schedules for 4-30 people across 2-10 tables
- **Two Modes**: 
  - **Fixed Anchors**: One person stays at each table while others rotate
  - **Dynamic Rotation**: Everyone rotates between tables
- **Time Optimization**: Automatically calculates optimal number of rounds based on your time constraints
- **Visual Grid Display**: Clear, easy-to-read schedule showing each round's table assignments
- **Export Options**: Download as CSV or print the schedule
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open the Application**: Simply open `index.html` in any modern web browser
2. **Enter Your Parameters**:
   - **Total People**: Number of participants (4-30)
   - **Number of Tables**: How many tables you have available (2-10)
   - **Max per Table**: Maximum people that can sit at each table (2-6)
   - **Minutes per Round**: How long each round should last (5-30 minutes)
   - **Total Available Time**: Your total time budget (30-180 minutes)
3. **Choose Schedule Type**:
   - Check "Use Fixed Anchors" for the anchor system
   - Leave unchecked for full rotation
4. **Generate**: Click "Generate Matrix" to create your schedule
5. **Export**: Use the export buttons to save or print your schedule

## Algorithm

The application uses a hybrid approach combining:

- **Social Golfer Problem** principles for optimal coverage
- **Round-robin scheduling** for fair rotation
- **Time-based optimization** to fit within your constraints
- **Randomized shuffling** to ensure variety in groupings

### Fixed Anchors Mode
- One person stays at each table as an "anchor"
- Other participants rotate around the anchors
- Simplifies logistics and ensures consistent table leadership
- Best for teaching-focused sessions

### Dynamic Rotation Mode
- Everyone rotates between tables
- Maximum interaction between all participants
- More complex but provides complete coverage
- Best for peer-to-peer learning

## Mathematical Background

This problem is related to several well-known mathematical concepts:

- **Social Golfer Problem**: Ensuring everyone plays with everyone else exactly once
- **Kirkman Triple System**: A specific case with groups of 3
- **Block Design**: Mathematical framework for these types of problems
- **Round-Robin Tournament**: Similar concept for sports/competitions

## Example Scenarios

### Scenario 1: 12 People, 3 Tables, Fixed Anchors
- **Setup**: 3 anchors + 9 rotating participants
- **Rounds**: 4-5 rounds (depending on time constraints)
- **Result**: Each rotating person meets all anchors and most other participants

### Scenario 2: 16 People, 4 Tables, Dynamic Rotation
- **Setup**: Everyone rotates between all tables
- **Rounds**: 5-6 rounds
- **Result**: Maximum interaction between all participants

## Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies
- **Responsive Design**: Works on all device sizes
- **Local Processing**: All calculations happen in your browser
- **Export Formats**: CSV for spreadsheet compatibility
- **Print-Friendly**: Optimized layout for printing

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## File Structure

```
trickdrive/
├── index.html      # Main application file
├── styles.css      # Styling and layout
├── script.js       # Core algorithm and functionality
└── README.md       # This documentation
```

## Usage Tips

1. **Start Small**: Test with smaller groups first to understand the output
2. **Consider Logistics**: Fixed anchors can be easier to manage in practice
3. **Time Planning**: Allow 2-3 minutes between rounds for transitions
4. **Flexibility**: The algorithm prioritizes coverage over perfect mathematical solutions
5. **Export Early**: Save your schedule once generated to avoid losing it

## Contributing

This is a simple, self-contained application. Feel free to modify and adapt it for your specific needs. The core algorithm can be extended for other similar scheduling problems.

## License

This project is open source and available under the MIT License.

---

**Happy Trick Driving!** 🎩✨ 