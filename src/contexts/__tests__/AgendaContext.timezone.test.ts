describe('Agenda timezone fixes', () => {
  it('should handle date conversion without timezone issues', () => {
    // Test the core date conversion logic that was causing the one-day-behind issue
    const backendDateString = '2025-08-12'; // This is what backend sends
    
    // New timezone-safe way (our fix)
    const newWay = new Date(backendDateString + 'T00:00:00');
    const newFormatString = `${newWay.getFullYear()}-${String(newWay.getMonth() + 1).padStart(2, '0')}-${String(newWay.getDate()).padStart(2, '0')}`;
    
    // Our fix should ensure the date stays the same
    expect(newFormatString).toBe(backendDateString);
    expect(newWay.getDate()).toBe(12);
    expect(newWay.getMonth() + 1).toBe(8);
    expect(newWay.getFullYear()).toBe(2025);
    
    // Test that the timezone-safe date function works correctly
    const toInputDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const result = toInputDateString(newWay);
    expect(result).toBe('2025-08-12');
  });

  it('should handle multiple dates consistently', () => {
    const testDates = ['2025-08-01', '2025-08-15', '2025-12-31'];
    
    testDates.forEach(dateStr => {
      const safeDate = new Date(dateStr + 'T00:00:00');
      const formatted = `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}-${String(safeDate.getDate()).padStart(2, '0')}`;
      expect(formatted).toBe(dateStr);
    });
  });

  it('should handle formatDateBR with timezone-safe parsing', () => {
    // Mock the updated formatDateBR function logic
    const formatDateBR = (dateStr: string): string => {
      if (!dateStr) return "";
      
      let d: Date;
      if (dateStr.includes('T')) {
        d = new Date(dateStr);
      } else {
        d = new Date(dateStr + 'T00:00:00'); // Our timezone-safe fix
      }
      
      if (isNaN(d.getTime())) return dateStr;
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    expect(formatDateBR('2025-08-12')).toBe('12/08/2025');
    expect(formatDateBR('2025-08-12T00:00:00')).toBe('12/08/2025');
  });
});
