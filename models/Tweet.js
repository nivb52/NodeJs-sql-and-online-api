module.exports = function(Sequelize, DataTypes) {
  const Tweet = Sequelize.define("Tweet", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      isUUID: 6
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^((?!true|false|TRUE|FALSE).){1,255}$ /,
        notEmpty: true // don't allow empty strings
        // is: /^[a-z]+$/i // will only allow letters
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^((?!true|false|TRUE|FALSE).){1,255}$ /,
        notEmpty: false // allow empty
      }
    },
    tweet_account: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: false, // allow empty
        isEmail: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return Tweet;
};
