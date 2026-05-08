const { Query } = require('../database/util/queries.util');
const { Master } = require('../database/model/Master');
const { SQLQueryBuilder } = require('../util/helper.util');
const sql = new SQLQueryBuilder();

const getRouteAccessById = async (req, res, next) => {
  try {
    const { access_id } = req.body;

    if (!access_id) {
      return res.status(400).json({
        success: false,
        message: 'Access ID is required'
      });
    }

    const query = sql.select([
      { col: Master.master_route_access.selectOptionColumns.id, as: 'id' },
      { col: Master.master_route_access.selectOptionColumns.access_id, as: 'access_id' },
      { col: Master.master_route_access.selectOptionColumns.name, as: 'name' },
      { col: Master.master_route_access.selectOptionColumns.status, as: 'status' }
    ])
      .from(Master.master_route_access.tablename)
      .where(`${Master.master_route_access.selectOptionColumns.access_id} = ?`)
      .build();

    const routes = await Query(query, [access_id], [Master.master_route_access.prefix_]);

    res.status(200).json({
      success: true,
      message: 'Route access retrieved successfully',
      data: routes,
      count: routes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get route access error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching route access',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateRouteAccess = async (req, res, next) => {
  try {
    const { access_id, name, status } = req.body;

    if (!access_id) {
      return res.status(400).json({
        success: false,
        message: 'Access ID is required'
      });
    }

    const updateQuery = sql.update(Master.master_route_access.tablename)
      .set({
        [Master.master_route_access.updateOptionColumns.name]: name,
        [Master.master_route_access.updateOptionColumns.status]: status
      })
      .where(`${Master.master_route_access.updateOptionColumns.access_id} = ?`)
      .build();

    await Query(updateQuery, [access_id], [Master.master_route_access.prefix_]);

    res.status(200).json({
      success: true,
      message: 'Route access updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update route access error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while updating route access',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getRouteAccessById,
  updateRouteAccess,
};
