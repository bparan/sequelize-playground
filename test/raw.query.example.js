const Sequelize = require('sequelize');
const {expect} = require('chai');

describe('Raw Query Example', () => {

    const sequelize = new Sequelize('sequelize_test', 'user', 'password', {
        host: 'localhost',
        dialect: 'mssql'
    });

    after(() => {
        sequelize.close();
    });

    it('User table should have 0 records', async () => {
        const userRecords = await sequelize.query('select count(*) as cnt from [user]');

        // sequelize returns an array by default
        // first array - array of results
        // metadata object - number of affected records
        expect(userRecords[0][0].cnt).to.equal(0);
    });

    it('User table should have 0 records. Select only.', async() => {
        const userRecords = await sequelize.query('select count(*) as cnt from [user]', {
            type: sequelize.QueryTypes.SELECT
        });

        expect(userRecords[0].cnt).to.equal(0);
    });

    describe('#userId = 1. No query types.', () => {
        it('Insert a user', async() => {
            const result = await sequelize.query({
                query: 'insert into [user](id, username, birthdate, email) values(?, ?, ?, ?)',
                values: [1, 'test_user', '1980-10-10', '1@1.com']
            });
    
            // [undefined, 1]
            expect(result[1]).to.equal(1);
    
            const userRecords = await sequelize.query('select count(*) as cnt from [user]', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(userRecords[0].cnt).to.equal(1);
        });
    
        it('Update a user', async() => {
            const result = await sequelize.query({
                query: 'update [user] set username = \'new_user_name\' where id = ?',
                values: [1]
            });
    
            // [[], []]
            expect(result.length).to.equal(2);
            expect(result[0].length).to.equal(0);
            expect(result[1].length).to.equal(0);
    
            const usernameResult = await sequelize.query('select username from [user] where id = 1', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(usernameResult[0].username).to.equal('new_user_name');
        });
    
        it('Delete a user', async() => {
            const result = await sequelize.query({
                query: 'delete from [user] where id=?',
                values: [1]
            });
    
            //  [[], []]
            expect(result.length).to.equal(2);
            expect(result[0].length).to.equal(0);
            expect(result[1].length).to.equal(0);
    
            const userRecords = await sequelize.query('select count(*) as cnt from [user]', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(userRecords[0].cnt).to.equal(0);
        });
    });

    describe('#userId = 2. With query types', () => {
        it('Insert a user. Query type INSERT', async() => {
            const result = await sequelize.query({
                query: 'insert into [user](id, username, birthdate, email) values(?, ?, ?, ?)',
                values: [2, 'test_user2', '1980-10-10', '2@2.com'],
                type: sequelize.QueryTypes.INSERT
            });
    
            // [undefined, 1]
            expect(result[1]).to.equal(1);
    
            const userRecords = await sequelize.query('select count(*) as cnt from [user]', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(userRecords[0].cnt).to.equal(1);
        });
    
        it('Update a user. Query type UPDATE', async() => {
            const result = await sequelize.query({
                query: 'update [user] set username = \'new_user_name\' where id = ?',
                values: [2],
                type: sequelize.QueryTypes.UPDATE
            });
    
            // [[], []]
            expect(result.length).to.equal(2);
            expect(result[0].length).to.equal(0);
            expect(result[1].length).to.equal(0);
    
            const usernameResult = await sequelize.query('select username from [user] where id = 2', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(usernameResult[0].username).to.equal('new_user_name');
        });
    
        it('Delete a user. Query type DELETE', async() => {
            const result = await sequelize.query({
                query: 'delete from [user] where id=?',
                values: [2],
                type: sequelize.QueryTypes.DELETE
            });
    
            //  [[], []]
            expect(result.length).to.equal(2);
            expect(result[0].length).to.equal(0);
            expect(result[1].length).to.equal(0);
    
            const userRecords = await sequelize.query('select count(*) as cnt from [user]', {
                type: sequelize.QueryTypes.SELECT
            });
    
            expect(userRecords[0].cnt).to.equal(0);
        });
    });

});