/**
 * Utility to format and display the generated schedule
 */

const { DAYS, TIME_SLOTS_PER_DAY } = require('./models');

class ScheduleFormatter {
  constructor(trainers, rooms, trainings) {
    this.trainers = trainers;
    this.rooms = rooms;
    this.trainings = trainings;
    
    // Day names for display
    this.dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Time slot labels (assuming 8 slots starting from 9:00)
    this.timeSlotLabels = [
      {start: '09:00', end: '10:00'},
      {start: '10:00', end: '11:00'},
      {start: '11:00', end: '12:00'},
      {start: '12:00', end: '13:00'},
      {start: '13:00', end: '14:00'},
      {start: '14:00', end: '15:00'},
      {start: '15:00', end: '16:00'},
      {start: '16:00', end: '17:00'}
    ];
  }

  /**
   * Format a schedule as a human-readable string
   */
  formatSchedule(schedule) {
    let output = 'TRAINING SCHEDULE\n================\n\n';

    // Sort schedule by day, then by time slot
    const sortedSchedule = [...schedule].sort((a, b) => {
      if (a.day !== b.day){
        return a.day - b.day;
      } else {
        return a.timeSlot - b.timeSlot;
      }
    });

    const sortedSchedulePrint = sortedSchedule.map(s => {
      const training = this.trainings.find(t => t.id === s.trainingId);
      const timeSlotLabel = this.getTimeSlotLabel(s.timeSlot, training.duration);
      return { 
        name: this.trainers.find(t => t.id === s.trainerId).name,
        title: this.trainings.find(t => t.id === s.trainingId).title,
        room: this.rooms.find(r => r.id === s.roomId).name,
        day: this.dayNames[s.day],
        timeSlot: timeSlotLabel
      }
    });
    console.table(sortedSchedulePrint);

    let minDay = Math.min(...sortedSchedule.map(s => s.day));
    let maxDay = Math.max(...sortedSchedule.map(s => s.day));
    
    // Group by day
    for (let day = minDay; day <= maxDay; day++) {
      const daySchedule = sortedSchedule.filter(s => s.day === day);

      if (daySchedule.length === 0) continue;
      
      output += `${this.dayNames[day]}\n${'-'.repeat(this.dayNames[day].length)}\n\n`;
      
      // Group by room
      this.rooms.forEach(room => {
        const roomSchedule = daySchedule.filter(s => s.roomId === room.id);
        
        if (roomSchedule.length === 0) return;
        
        output += `Room: ${room.name} (Capacity: ${room.capacity})\n`;
        
        // Sort by time slot
        const sortedRoomSchedule = roomSchedule.sort((a, b) => a.timeSlot - b.timeSlot);
        
        sortedRoomSchedule.forEach(scheduled => {
          const training = this.trainings.find(t => t.id === scheduled.trainingId);
          const trainer = this.trainers.find(t => t.id === scheduled.trainerId);
          const timeSlotLabel = this.getTimeSlotLabel(scheduled.timeSlot, training.duration);
          
          output += `  ${timeSlotLabel}: ${training.title} (Trainer: ${trainer.name})\n`;
        });
        
        output += '\n';
      });
      
      output += '\n';
    }
    
    // Add statistics
    output += this.generateStatistics(schedule);
    
    return output;
  }

  /**
   * Get a formatted time slot label based on start time and duration
   */
  getTimeSlotLabel(startSlotIndex, duration = 1) {
    let startSlot;
    let endSlot;
   
    if (duration === 1) {
      startSlot = this.timeSlotLabels[startSlotIndex].start;
      endSlot = this.timeSlotLabels[startSlotIndex].end;
    } else {
      startSlot = this.timeSlotLabels[startSlotIndex].start;
      endSlot = this.timeSlotLabels[startSlotIndex + duration - 1].end;
    }
    
    return `${startSlot}-${endSlot}`; 
  }

  /**
   * Generate statistics about the schedule
   */
  generateStatistics(schedule) {
    let stats = 'STATISTICS\n==========\n\n';
    
    // Count scheduled trainings per type
    stats += 'Training Occurrences:\n';
    this.trainings.forEach(training => {
      const count = schedule.filter(s => s.trainingId === training.id).length;
      const satisfaction = (count / training.requiredOccurrences * 100).toFixed(0);
      stats += `  ${training.title}: ${count}/${training.requiredOccurrences} (${satisfaction}%)\n`;
    });
    
    stats += '\n';
    
    // Count trainer utilization
    stats += 'Trainer Utilization:\n';
    this.trainers.forEach(trainer => {
      const trainerSchedule = schedule.filter(s => s.trainerId === trainer.id);
      const totalHours = trainerSchedule.reduce((sum, s) => {
        const training = this.trainings.find(t => t.id === s.trainingId);
        return sum + training.duration;
      }, 0);
      
      stats += `  ${trainer.name}: ${trainerSchedule.length} sessions (${totalHours} hours)\n`;
    });
    
    stats += '\n';
    
    // Count room utilization
    stats += 'Room Utilization:\n';
    this.rooms.forEach(room => {
      const roomSchedule = schedule.filter(s => s.roomId === room.id);
      const totalHours = roomSchedule.reduce((sum, s) => {
        const training = this.trainings.find(t => t.id === s.trainingId);
        return sum + training.duration;
      }, 0);
      
      const maxPossibleHours = room.availableDays.length * TIME_SLOTS_PER_DAY;
      const utilizationPercentage = (totalHours / maxPossibleHours * 100).toFixed(1);
      
      stats += `  ${room.name}: ${roomSchedule.length} sessions (${totalHours}/${maxPossibleHours} hours, ${utilizationPercentage}%)\n`;
    });
    
    return stats;
  }
}

module.exports = ScheduleFormatter; 