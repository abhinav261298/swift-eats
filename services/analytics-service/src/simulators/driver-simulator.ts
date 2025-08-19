import { Logger } from '@nestjs/common';
import { DriverLocationDto } from '../dto/analytics.dto';

export class DriverSimulator {
  private readonly logger = new Logger(DriverSimulator.name);
  private drivers: Map<string, DriverLocationDto> = new Map();
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  // Mumbai coordinates for realistic simulation
  private readonly MUMBAI_CENTER = {
    latitude: 19.0760,
    longitude: 72.8777,
  };

  private readonly DRIVER_STATUSES = ['available', 'busy', 'offline', 'delivering'];

  constructor(
    private readonly onLocationUpdate: (driverId: string, location: DriverLocationDto) => void,
    private readonly maxDrivers: number = 50,
    private readonly updateInterval: number = 100 // 10 events per second (100ms interval)
  ) {}

  start(): void {
    if (this.isRunning) {
      this.logger.warn('Driver simulator is already running');
      return;
    }

    this.logger.log(`Starting driver simulator with ${this.maxDrivers} drivers`);
    this.isRunning = true;

    // Initialize drivers
    this.initializeDrivers();

    // Start location updates
    this.interval = setInterval(() => {
      this.updateDriverLocations();
    }, this.updateInterval);
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Driver simulator is not running');
      return;
    }

    this.logger.log('Stopping driver simulator');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.drivers.clear();
  }

  private initializeDrivers(): void {
    for (let i = 1; i <= this.maxDrivers; i++) {
      const driverId = `driver_${i.toString().padStart(3, '0')}`;
      
      // Generate random starting position around Mumbai
      const location = this.generateRandomLocation();
      
      this.drivers.set(driverId, {
        driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: Math.random() * 50, // 0-50 km/h
        heading: Math.random() * 360, // 0-360 degrees
        status: this.DRIVER_STATUSES[Math.floor(Math.random() * this.DRIVER_STATUSES.length)],
        timestamp: new Date(),
        accuracy: 5 + Math.random() * 10, // 5-15 meters accuracy
        batteryLevel: 20 + Math.random() * 80, // 20-100% battery
      });
    }

    this.logger.log(`Initialized ${this.drivers.size} drivers`);
  }

  private updateDriverLocations(): void {
    const updates: Array<{ driverId: string; location: DriverLocationDto }> = [];

    this.drivers.forEach((driver, driverId) => {
      // Update location based on current speed and heading
      const newLocation = this.calculateNewLocation(driver);
      
      // Update driver data
      const updatedDriver: DriverLocationDto = {
        ...driver,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        speed: this.updateSpeed(driver.speed),
        heading: this.updateHeading(driver.heading),
        status: this.updateStatus(driver.status),
        timestamp: new Date(),
        batteryLevel: this.updateBatteryLevel(driver.batteryLevel),
      };

      this.drivers.set(driverId, updatedDriver);
      updates.push({ driverId, location: updatedDriver });
    });

    // Send updates
    updates.forEach(({ driverId, location }) => {
      this.onLocationUpdate(driverId, location);
    });

    this.logger.debug(`Updated ${updates.length} driver locations`);
  }

  private generateRandomLocation(): { latitude: number; longitude: number } {
    // Generate random location within ~20km radius of Mumbai center
    const radius = 0.18; // ~20km in degrees
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;

    return {
      latitude: this.MUMBAI_CENTER.latitude + distance * Math.cos(angle),
      longitude: this.MUMBAI_CENTER.longitude + distance * Math.sin(angle),
    };
  }

  private calculateNewLocation(driver: DriverLocationDto): { latitude: number; longitude: number } {
    // Convert speed from km/h to degrees per second (approximate)
    const speedInDegreesPerSecond = driver.speed / 111000; // 1 degree ≈ 111km
    const timeElapsed = this.updateInterval / 1000; // Convert to seconds

    const distance = speedInDegreesPerSecond * timeElapsed;
    const headingRadians = (driver.heading * Math.PI) / 180;

    return {
      latitude: driver.latitude + distance * Math.cos(headingRadians),
      longitude: driver.longitude + distance * Math.sin(headingRadians),
    };
  }

  private updateSpeed(currentSpeed: number): number {
    // Simulate realistic speed changes
    const maxChange = 5; // km/h
    const change = (Math.random() - 0.5) * 2 * maxChange;
    const newSpeed = Math.max(0, Math.min(80, currentSpeed + change)); // 0-80 km/h
    
    return newSpeed;
  }

  private updateHeading(currentHeading: number): number {
    // Simulate realistic heading changes
    const maxChange = 30; // degrees
    const change = (Math.random() - 0.5) * 2 * maxChange;
    let newHeading = currentHeading + change;
    
    // Normalize to 0-360 degrees
    while (newHeading < 0) newHeading += 360;
    while (newHeading >= 360) newHeading -= 360;
    
    return newHeading;
  }

  private updateStatus(currentStatus: string): string {
    // Occasionally change status
    if (Math.random() < 0.01) { // 1% chance per update
      return this.DRIVER_STATUSES[Math.floor(Math.random() * this.DRIVER_STATUSES.length)];
    }
    return currentStatus;
  }

  private updateBatteryLevel(currentBattery: number): number {
    // Simulate battery drain
    const drainRate = 0.01; // 1% per update
    const newBattery = Math.max(0, currentBattery - drainRate);
    
    // Occasionally "charge" the battery (simulate driver charging)
    if (newBattery < 10 && Math.random() < 0.1) {
      return Math.min(100, newBattery + 20);
    }
    
    return newBattery;
  }

  getDriverCount(): number {
    return this.drivers.size;
  }

  getDriverLocation(driverId: string): DriverLocationDto | undefined {
    return this.drivers.get(driverId);
  }

  getAllDriverLocations(): DriverLocationDto[] {
    return Array.from(this.drivers.values());
  }

  isSimulatorRunning(): boolean {
    return this.isRunning;
  }
}
