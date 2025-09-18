import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Clients extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un cliente puede tener muchos pagos
      // Clients.hasMany(models.Payments, {
      //   foreignKey: 'clientId',
      //   as: 'payments'
      // });
      // Un cliente puede tener muchos créditos
      Clients.hasMany(models.Credits, {
        foreignKey: 'clientId',
        as: 'credits',
      });
    }

    // Instance methods
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    isActive() {
      return this.status === 'active';
    }

    canReceiveCredit(amount) {
      return this.currentBalance + amount <= this.maxCredit;
    }

    // Static methods
    static async findActive() {
      return this.findAll({
        where: { status: 'active' },
      });
    }

    static async findByEmail(email) {
      // Don't search if email is empty or null
      if (!email || email.trim() === '') {
        return null;
      }
      return this.findOne({
        where: { email: email.trim().toLowerCase() },
      });
    }

    static async getStats() {
      const { Op } = sequelize.Sequelize;

      // Obtener fecha del primer día del mes actual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Contar total de clientes
      const totalClients = await this.count();

      // Contar clientes activos
      const activeClients = await this.count({
        where: { status: 'active' },
      });

      // Contar clientes inactivos (inactive + suspended)
      const inactiveClients = await this.count({
        where: {
          status: {
            [Op.in]: ['inactive', 'suspended'],
          },
        },
      });

      // Contar nuevos clientes del mes
      const newClientsThisMonth = await this.count({
        where: {
          createdAt: {
            [Op.gte]: firstDayOfMonth,
          },
        },
      });

      return {
        totalClients,
        activeClients,
        inactiveClients,
        newClientsThisMonth,
      };
    }
  }

  Clients.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      identificationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
          is: /^[0-9]+$/,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[+]?[0-9\s\-()]+$/,
          len: [7, 15],
        },
      },
      address: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'inactive',
      },
      currentBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('currentBalance');
          return value ? parseFloat(value) : 0;
        },
      },
      maxCredit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('maxCredit');
          return value ? parseFloat(value) : 0;
        },
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue('basePrice');
          return value ? parseFloat(value) : 0;
        },
      },
      observations: {
        type: DataTypes.TEXT,
      },
      // Virtual field for full name
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    {
      sequelize,
      modelName: 'Clients',

      // Hooks
      // Normalize email to lowercase
      hooks: {
        beforeCreate: client => {
          if (client.email) client.email = client.email.toLowerCase();
          client.firstName = client.firstName.trim();
          client.lastName = client.lastName.trim();
        },
        beforeUpdate: client => {
          if (client.email) {
            client.email = client.email.toLowerCase();
          }
        },
      },

      // Indexes
      indexes: [
        {
          fields: ['email'],
          unique: true,
        },
        { fields: ['status'] },
      ],

      // Scopes
      scopes: {
        active: {
          where: { status: 'active' },
        },
        withBalance: {
          where: {
            currentBalance: {
              [sequelize.Sequelize.Op.gt]: 0,
            },
          },
        },
      },
    }
  );

  return Clients;
};
