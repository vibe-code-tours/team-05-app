---
name: bullmq
description: BullMQ job queue rules — async processing, workers, retries, rate limiting, and job scheduling
---

# BullMQ Skill

## Use Cases

- Email sending (order confirmation, notifications)
- SMS delivery (OTP, alerts)
- Payment verification
- Order status updates
- Image processing
- Report generation
- Scheduled tasks (daily backups, cleanup)

---

## Queue Setup

```typescript
// queue.module.ts
@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'order-processing' },
      { name: 'image-processing' },
    ),
  ],
})
export class QueueModule {}
```

---

## Producer (Adding Jobs)

```typescript
@Injectable()
export class OrderService {
  constructor(
    @InjectQueue('order-processing') private orderQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const order = await this.repository.create(dto);

    // Add job to queue
    await this.orderQueue.add('process-order', {
      orderId: order.id,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return order;
  }
}
```

---

## Consumer (Workers)

```typescript
@Processor('order-processing')
export class OrderProcessingWorker {
  private readonly logger = new Logger(OrderProcessingWorker.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly emailQueue: Queue,
  ) {}

  @Process('process-order')
  async handleProcessOrder(job: Job<{ orderId: string }>) {
    this.logger.log(`Processing order ${job.data.orderId}`);

    // 1. Verify payment
    await this.orderService.verifyPayment(job.data.orderId);

    // 2. Update inventory
    await this.orderService.updateInventory(job.data.orderId);

    // 3. Create shipment
    await this.orderService.createShipment(job.data.orderId);

    // 4. Send confirmation email
    await this.emailQueue.add('send-order-confirmation', {
      orderId: job.data.orderId,
    });

    return { success: true };
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }
}
```

---

## Job Options

```typescript
await queue.add('task', data, {
  attempts: 3,                    // Retry 3 times
  backoff: {
    type: 'exponential',          // Exponential backoff
    delay: 2000,                  // Start with 2s delay
  },
  delay: 5000,                    // Delay 5s before processing
  priority: 1,                    // Higher priority (1 = highest)
  removeOnComplete: 100,          // Keep last 100 completed jobs
  removeOnFail: 50,               // Keep last 50 failed jobs
});
```

---

## Rules

**Always:**
- Handle errors in workers
- Use retries with backoff
- Log job start and completion
- Set appropriate timeouts
- Monitor queue health

**Never:**
- Put blocking operations in jobs
- Skip error handling
- Use infinite retries
- Store sensitive data in jobs
- Ignore failed jobs
