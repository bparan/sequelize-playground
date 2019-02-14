const Sequelize = require('sequelize');
const {expect} = require('chai');
const Op = Sequelize.Op;

describe('Querying', () => {

    const sequelize = new Sequelize('sequelize_test', 'user', 'password', {
        host: 'localhost',
        dialect: 'mssql'
    });

    const User = sequelize.define('user', {
        id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
        username: Sequelize.STRING,
        birthdate: Sequelize.DATE,
        email: Sequelize.STRING
    }, {
        tableName: 'user',
        timestamps: false
    });

    after(() => {
        sequelize.close();
    });

    afterEach(async () => {
        User.destroy({
            where: {}
        });
    });

    describe('Attributes', () => {

        beforeEach( async () => {
            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1989-01-01',
                email: 'user@company.com'
            });
        });

        it('Select username attribute only', async() => {
            const users = await User.findAll({
                attributes: ['username']
            });

            expect(users).to.have.lengthOf(1);
            expect(users[0].username).to.equal('user');
            expect(users[0].id).to.be.undefined;
            expect(users[0].birhtdate).to.be.undefined;
            expect(users[0].email).to.be.undefined;
        });

        it('Select username as name', async() => {
            const users = await User.findAll({
                attributes: [['username', 'login']]
            });

            expect(users).to.have.lengthOf(1);
            expect(users[0].username).to.be.undefined;
            expect(users[0].get('login')).to.equal('user');
        });

        it('Select number of users in table', async() => {
            const users = await User.findAll({
                attributes: [[sequelize.fn('COUNT', sequelize.col('username')), 'users_count']]
            });

            expect(users).to.have.lengthOf(1);
            expect(users[0].id).to.be.undefined;
            expect(users[0].username).to.be.undefined;
            expect(users[0].birthdate).to.be.undefined;
            expect(users[0].email).to.be.undefined;
            expect(users[0].get('users_count')).to.equal(1);
        });

        it('Select number of users in table #2', async() => {
            const users = await User.findAll({
                attributes: {
                    include: [[sequelize.fn('COUNT', sequelize.col('username')), 'users_count']]
                },
                group: ['username','birthdate', 'email', 'id']
            });

            expect(users).to.have.lengthOf(1);
            expect(users[0].id).to.equal('1');
            expect(users[0].username).to.equal('user');
            expect(users[0].birthdate.toFormat('YYYY-MM-DD')).to.equal('1989-01-01');
            expect(users[0].email).to.equal('user@company.com');
            expect(users[0].get('users_count')).to.equal(1);
        });

    });

    describe('Where', () => {

        it('Should not find user with id == 1', async () => {
            const users = await User.findAll({
                where: {
                    id: 1
                }
            });

            expect(users).to.be.empty;
        })

        it('Should find user with id = 1', async () => {
            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1989-01-01',
                email: 'user@company.com'
            });

            const users = await User.findAll({
                where: {
                    id: 1
                }
            });

            expect(users).to.have.lengthOf(1);
            expect(users[0].id).to.equal('1');
        });


        it('Should find user with username \'user\' and email: \'user@company.com\'', async () => {
            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1989-01-01',
                email: 'user@company.com'
            });

            const users = await User.findAll({
                where: {
                    username: 'user',
                    email: 'user@company.com'
                }
            });

            expect(users).to.have.lengthOf(1);
        });

        it('Should find user with username \'user\' or email \'user@company.com\'', async () => {
            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1989-01-01',
                email: 'user@company.com'
            });

            const users = await User.findAll({
                where: {
                    [Op.or]: {
                        username: 'user',
                        email: 'user1@company.com'
                    }
                }
            });

            expect(users).to.have.lengthOf(1);
        });

        it('Combine multiple operators', async () => {
            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1989-01-01',
                email: 'user@company.com'
            });

            const users = await User.findAll({
                where: {
                    username: {
                        [Op.or]: {
                            [Op.is]: null,
                            [Op.eq]: 'user'
                        }
                    }
                }
            });

            expect(users).to.have.lengthOf(1);
        });

    });

});