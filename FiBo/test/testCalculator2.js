
function meanFun(dataGroups, couples, data, periods) {

    //console.log(data);

    let aggregation = [];

    for (let i = 0; i < data.length; i++) {

        const item = data[i];

        let j = periods.length - 1;

        let sum = 0;
        let elCounter = null;

        let p = 0;

        aggregation.push({ result: [], invalid: [] });

        console.log(couples[i].tag)

        while (j >= 0) {

            //
            //aggregate all data in one period
            //

            //console.log('ciak');
            if (p < item.length) {
                while (item[p].time >= periods[j] && p < item.length - 1) {

                    console.log(item[p].time, periods[j], item.length, p);

                    sum += item[p].value;
                    if (!elCounter) {
                        elCounter = 0;
                    }
                    elCounter++;

                    if (p < item.length - 1) {
                        p++;
                    }


                    /*
                    console.log('media fatta con ' + sum + + ' ' + elCounter)
                    console.log('quindi ' + item[p].time, periods[j])
                    if (item[p].time > periods[j]) {
                        j--;
                        continue;
                    }*/
                }
            }

            if (elCounter) {
                const mean = sum / elCounter;
                aggregation[i].result.push({ time: periods[j], value: mean });
                sum = 0;
                elCounter = null;
            } else {
                aggregation[i].invalid.push({ time: periods[j] });
            }

            j--;
        }

    }

    //console.log('caio');

    //console.log(aggregation);

    //console.log('caio');

    return internalAggregation(aggregation, dataGroups);

}