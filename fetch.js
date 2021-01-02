const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

const cityId = 28367 // random example, set the desired id

const getPageData = async ({ year, month, bday, fday }) => {
	
	console.log(`Page: ${year}/${month}/${bday}-${fday}`)
	const url = `http://www.pogodaiklimat.ru/weather.php?id=${cityId}&bday=${bday}&fday=${fday}&amonth=${month}&ayear=${year}&bot=2`

	try {
		const response =  await fetch(url);
		const body = await response.text();

		const $ = cheerio.load(body);
		
		const numbers = $('.archive-table-left-column table tbody tr:not(:first-child)')
		const values = $('.archive-table-wrap table tbody tr:not(:first-child)')
		
		const pageData = []

		numbers.each((i, elem) => {
			const d1 = $(elem).children()[0].children[0].data
			const d2 = $(elem).children()[1].children[0].data
			const date = `${d1}:00 ${d2}.${year}`
			pageData.push([date])
		})
		
		values.each((i, elem) => {
			for (let j = 0; j < 18; j++) {
				pageData[i].push($($(elem).children()[j]).text())
			}
		})
		
		return pageData
	} catch (e) {
		console.log("Error!" + e)
	}
}


(async () => {
	let allData = []

	const year = 2016
	for (let year = 2011; year <= 2020; year++) {
		for (let month = 1; month <= 12; month++) {

			const bday = 1
			const fday = new Date(year, month, 0).getDate()

			const pageData = await getPageData({ year, month, bday, fday })
			allData = allData.concat(pageData)
		}
	}

	console.log('############### All data:')
	console.log(allData)

	const dataToWrite = `const data = ${JSON.stringify(allData, null, ' ')}`

	fs.writeFile('data.js', dataToWrite, function (err) {
	if (err) return console.log(err)
		console.log('Saved!')
	})
})()