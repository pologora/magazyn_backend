const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const validateRequiredFields = require('../utils/validateRequiredFields');

const employeeCollection = client.db('magazyn').collection('Employee');
const workTimeCollection = client.db('magazyn').collection('Workdays');

exports.getAllSntiRaport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const start = new Date(`${startDate}Z`);
  const end = new Date(`${endDate}Z`);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  const sntiEmployees = await employeeCollection.find({ isSnti: true }).toArray();

  const employeeDataPromises = sntiEmployees.map(async (employee) => {
    const employeeId = employee._id.toString();
    const employeeData = await employeeCollection.aggregate([
      { $match: { _id: new ObjectId(employeeId) } },
      {
        $lookup: {
          from: 'Workdays',
          localField: '_id',
          foreignField: 'employeeId',
          as: 'workdays',
        },
      },
      {
        $addFields: {
          workdays: {
            $filter: {
              input: '$workdays',
              as: 'workday',
              cond: {
                $and: [
                  { $gte: ['$$workday.startWork', new Date(start)] },
                  { $lte: ['$$workday.startWork', new Date(end)] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          workhours: {
            $map: {
              input: '$workdays',
              as: 'workday',
              in: {
                id: '$$workday._id',
                startWork: '$$workday.startWork',
                endWork: '$$workday.endWork',
                total: { $divide: [{ $subtract: ['$$workday.endWork', '$$workday.startWork'] }, 1000 * 60] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalWorkHours: { $sum: '$workhours.total' },
        },
      },
      {
        $project: {
          workdays: 0,
          isSnti: 0,
          isWorking: 0,
          pin: 0,
          vacationDaysPerYear: 0,
        },
      },
      {
        $lookup: {
          from: 'Vacations',
          let: { employeeId: '$_id' },
          pipeline: [
            {

              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employeeId', '$$employeeId'] }, // keep this line
                    {
                      $or: [
                        // Condition 1: Vacation starts within the date range
                        {
                          $and: [
                            { $gte: ['$startVacation', new Date(start)] },
                            { $lte: ['$startVacation', new Date(end)] },
                          ],
                        },
                        // Condition 2: Vacation ends within the date range
                        {
                          $and: [
                            { $gte: ['$endVacation', new Date(start)] },
                            { $lte: ['$endVacation', new Date(end)] },
                          ],
                        },
                        // Condition 3: Vacation starts before the range and ends after
                        {
                          $and: [
                            { $lte: ['$startVacation', new Date(start)] },
                            { $gte: ['$endVacation', new Date(end)] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'vacations',
        },
      },
    ]).toArray();

    return employeeData[0];
  });

  const allEmployeeData = await Promise.all(employeeDataPromises);

  res.status(200).json({
    status: 'success',
    data: allEmployeeData,
  });
});

exports.getRaportByEmployeeId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  validateRequiredFields(req.query, ['startDate', 'endDate']);
  const { startDate, endDate } = req.query;

  const start = new Date(`${startDate}Z`);
  const end = new Date(`${endDate}Z`);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  const employeeData = await employeeCollection.aggregate([
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: 'Workdays',
        localField: '_id',
        foreignField: 'employeeId',
        as: 'workdays',
      },
    },
    {
      $addFields: {
        workdays: {
          $filter: {
            input: '$workdays',
            as: 'workday',
            cond: {
              $and: [
                { $gte: ['$$workday.startWork', new Date(start)] },
                { $lte: ['$$workday.startWork', new Date(end)] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        workhours: {
          $map: {
            input: '$workdays',
            as: 'workday',
            in: {
              id: '$$workday._id',
              startWork: '$$workday.startWork',
              endWork: '$$workday.endWork',
              total: { $divide: [{ $subtract: ['$$workday.endWork', '$$workday.startWork'] }, 1000 * 60] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        totalWorkHours: { $sum: '$workhours.total' },
      },
    },
    {
      $project: {
        workdays: 0,
        isSnti: 0,
        isWorking: 0,
        pin: 0,
        vacationDaysPerYear: 0,
      },
    },
    {
      $lookup: {
        from: 'Vacations',
        let: { employeeId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$employeeId', '$$employeeId'] }, // keep this line
                  {
                    $or: [
                      // Condition 1: Vacation starts within the date range
                      {
                        $and: [
                          { $gte: ['$startVacation', new Date(start)] },
                          { $lte: ['$startVacation', new Date(end)] },
                        ],
                      },
                      // Condition 2: Vacation ends within the date range
                      {
                        $and: [
                          { $gte: ['$endVacation', new Date(start)] },
                          { $lte: ['$endVacation', new Date(end)] },
                        ],
                      },
                      // Condition 3: Vacation starts before the range and ends after
                      {
                        $and: [
                          { $lte: ['$startVacation', new Date(start)] },
                          { $gte: ['$endVacation', new Date(end)] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'vacations',
      },
    },
  ]).toArray();

  res.status(200).json({
    status: 'success',
    data: employeeData,
  });
});

exports.getEmployeesOveralHours = catchAsync(async (req, res, next) => {
  const { startDate, endDate, isSnti = false } = req.query;

  const start = new Date(`${startDate}Z`);
  const end = new Date(`${endDate}Z`);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  const result = await workTimeCollection.aggregate([
    {
      $match: {
        startWork: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$employeeId',
        totalWorkMinutes: {
          $sum: {
            $divide: [
              { $subtract: ['$endWork', '$startWork'] },
              1000 * 60,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'Employee',
        localField: '_id',
        foreignField: '_id',
        as: 'employee',
      },
    },
    {
      $unwind: '$employee',
    },
    {
      $match: {
        'employee.isSnti': isSnti === 'true', // or false depending on your query string format
      },
    },
    {
      $project: {
        _id: 0,
        name: '$employee.name',
        surname: '$employee.surname',
        agency: '$employee.agency',
        isSnti: '$employee.isSnti',
        totalWorkMinutes: 1,
      },
    },
    {
      $sort: {
        totalWorkMinutes: 1,
      },
    },
  ]).toArray();

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
