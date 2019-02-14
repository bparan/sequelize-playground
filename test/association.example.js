const Sequelize = require('sequelize');
const {expect} = require('chai');

describe('Associations', () => {
    
    const sequelize = new Sequelize('sequelize_test', 'user', 'password', {
        host: 'localhost',
        dialect: 'mssql'
    });

    after(() => {
        sequelize.close();
    });

    describe('One-to-One', () => {
        
        const Company = sequelize.define('company', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            name: {type: Sequelize.STRING, allowNull: false}
        });

        const User = sequelize.define('user', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            name: {type: Sequelize.STRING, allowNull: false}
        });

        after(async() => {
            await User.drop();
            await Company.drop();
        });

        afterEach(async() => {
            await User.destroy({
                where: {}
            });
            await Company.destroy({
                where: {}
            });
        });

        it('BelongsTo', async () => {
            User.belongsTo(Company); // Adds companyId to users table.

            await Company.sync();
            await User.sync();

            const companyInstance = await Company.create({
                id: 1,
                name: 'Company'
            });

            const userInstance = await User.create({
                id: 1,
                name: 'User'
            });

            await userInstance.setCompany(companyInstance);

            const resultUser = await User.findOne({
                where: {
                    companyId: companyInstance.id
                }
            });

            expect(resultUser.name).to.equal(userInstance.name);
        });

        it('HasOne', async() => {
            Company.hasOne(User); // Adds companyId to users table

            await Company.sync();
            await User.sync();

            const companyInstance = await Company.create({
                id: 1,
                name: 'Company'
            });

            const userInstance = await User.create({
                id: 1,
                name: 'User'
            });

            await companyInstance.setUser(userInstance);

            const resultUser = await User.findOne({
                where: {
                    companyId: companyInstance.id
                }
            });

            expect(resultUser.name).to.equal(userInstance.name);
        });

    });

    describe('To-Many', () => {
        const Company = sequelize.define('company', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            name: {type: Sequelize.STRING, allowNull: false}
        });

        const User = sequelize.define('user', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            name: {type: Sequelize.STRING, allowNull: false}
        });

        after(async() => {
            await User.drop();
            await Company.drop();
        });

        afterEach(async() => {
            await User.destroy({
                where: {}
            });
            await Company.destroy({
                where: {}
            });
        });

        it('One-To-Many', async() => {
            Company.hasMany(User);

            await Company.sync();
            await User.sync();

            const companyInstance = await Company.create({
                id: 1,
                name: 'Company'
            });

            const user1 = await User.create({
                id: 1,
                name: 'User1'
            });

            const user2 = await User.create({
                id: 2,
                name: 'User2'
            });

            await companyInstance.setUsers([user1, user2]);

            const users = await User.findAll({
                where: {
                    companyId: companyInstance.id
                }
            });

            expect(users).to.have.lengthOf(2);
            expect(users[0].getCompany).to.be.undefined;
        });

        it('One-To-Many bidirectional', async() => {
            Company.hasMany(User);
            User.belongsTo(Company);

            await Company.sync();
            await User.sync();

            const companyInstance = await Company.create({
                id: 1,
                name: 'Company'
            });

            const user1 = await User.create({
                id: 1,
                name: 'User1'
            });

            const user2 = await User.create({
                id: 2,
                name: 'User2'
            });

            await user1.setCompany(companyInstance);
            await user2.setCompany(companyInstance);

            const users = await User.findAll({
                where: {
                    companyId: companyInstance.id
                }
            });

            expect(users).to.have.lengthOf(2);
            expect(users[0].getCompany).to.be.not.undefined;
            expect(companyInstance.getUsers).to.be.not.undefined;
        });

        it('Belong-To-Many', async() => {
            const CompanyUser = sequelize.define('companyUser', {
                column: Sequelize.STRING
            });

            Company.belongsToMany(User, {through: 'CompanyUser'});
            User.belongsToMany(Company, {through: 'CompanyUser'});

            await CompanyUser.sync();
            await Company.sync();
            await User.sync();

            const companyInstance = await Company.create({
                id: 1,
                name: 'Company'
            });

            const user1 = await User.create({
                id: 1,
                name: 'User1'
            });

            const user2 = await User.create({
                id: 2,
                name: 'User2'
            });

            await companyInstance.addUser(user1);
            await companyInstance.addUser(user2);

            const users = await User.findAll({
                where: {
                    companyId: companyInstance.id
                }
            });

            expect(users).to.have.lengthOf(2);
            expect(companyInstance.setUsers).to.be.not.undefined;
            expect(companyInstance.addUser).to.be.not.undefined;
            expect(user1.addCompany).to.be.not.undefined;
        });
    });

});