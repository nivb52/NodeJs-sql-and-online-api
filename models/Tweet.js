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
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tweet_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isPending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  });

  return Tweet;
};
