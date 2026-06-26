import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController, TournamentsController } from './matches.controller';

@Module({
  controllers: [MatchesController, TournamentsController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
