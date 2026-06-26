import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { PredictionsModule } from './predictions/predictions.module';
import { RankingsModule } from './rankings/rankings.module';
import { BadgesModule } from './badges/badges.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MatchesModule,
    PredictionsModule,
    RankingsModule,
    BadgesModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule {}
