import { Controller, Get, Param } from '@nestjs/common';
import { ArmorsService } from './armors.service';
import { ApiParam, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Armors } from '@prisma/client';

@ApiTags('Armors')
@Controller('/armors')
export class ArmorsController {
  constructor(private readonly armorsService: ArmorsService) {}

  @ApiOperation({ summary: 'Get Armors By ID' })
  @ApiResponse({ status: 200, description: 'Returns specified armors' })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of a armors',
    allowEmptyValue: false,
    required: true,
  })
  @Get('/:id')
  public getArmorsById(@Param('id') id: string) {
    return this.armorsService.armor({ id: id });
  }

  @ApiOperation({ summary: 'Search Armors' })
  @ApiResponse({ status: 200, description: 'Returns specified armors' })
  @ApiParam({
    name: 'searchString',
    description: 'String to search for armors with',
    allowEmptyValue: false,
    required: true,
  })
  @Get('/search/:searchString')
  async searchArmors(
    @Param('searchString') searchString: string,
  ): Promise<Armors[]> {
    return this.armorsService.armors({
      where: {
        OR: [
          { name: { contains: searchString, mode: 'insensitive' } },
          { description: { contains: searchString, mode: 'insensitive' } },
        ],
      },
    });
  }
}
