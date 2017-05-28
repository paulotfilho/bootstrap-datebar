(function($) {
  $.fn.datebar = function( options ) {

    var element = $(".datebar");

    var params = $.extend({
      anchorToStart: false,
      anchorToEnd: false,
      hideRepeatedDates: true,
      startDate: '',
      endDate: '',
      dates: [],

    }, options);

    // Init datebar
    var datebar = '<div style="position: relative; margin-top: 20px;">' +
      '<div class="progress datebar-steps">' +
      '</div>' +
      '</div>';

    // Add initial datebar to element
    element.html(datebar);

    // Init start and end dates as Moment objects
    params.startDate = moment(params.startDate);
    params.endDate = moment(params.endDate);

    var firstUpdateOnStart = false;
    var lastUpdateOnEnd = false;
    var bothUpdatesOnStart = false;
    var bothUpdatesOnEnd = false;

    // Validate start and end dates
    if (params.startDate.isAfter(params.endDate)) {
      element.html('Please insert a start date before the end date.');
    } else {

      // Init dates as Moment objects, perform initial calc and transform to objects
      $.each(params.dates, function (key, value) {
        value = moment(value);

        params.dates[key] = {
          date: value,
          isSameAsStart: isSame(value, params.startDate),
          isSameAsEnd: isSame(value, params.endDate),
          isBeforeStart: isBefore(value, params.startDate),
          isBeforeEnd: isBefore(value, params.endDate),
          isAfterStart: isAfter(value, params.startDate),
          isAfterEnd: isAfter(value, params.endDate),
        };

        if (params.dates[key].isSameAsStart) {
          firstUpdateOnStart = true;
        }

        if (params.dates[key].isSameAsEnd) {
          lastUpdateOnEnd = true;
        }

      });

      if (params.dates[0].date.isSame(params.dates[1].date, 'd')) {
        if (params.dates[0].date.isSame(params.startDate, 'd')) {
          bothUpdatesOnStart = true;
        }
      }

      if (params.dates[0].date.isSame(params.dates[1].date, 'd')) {
        if (params.dates[0].date.isSame(params.endDate, 'd')) {
          bothUpdatesOnEnd = true;
        }
      }

      if (bothUpdatesOnStart) {
        element.html('Iniciado e finalizado na data de início.');
      } else if (bothUpdatesOnEnd) {
        element.html('Iniciado e finalizado na data de término.');
      } else {

        // Do not show repeated dates (cases where only date matters, not time)
        if (params.hideRepeatedDates) {
          params.dates = params.dates.filter(function (dateObj) {
            return !dateObj.isSameAsStart && !dateObj.isSameAsEnd;
          });
        }

        // Do not show dates before start date
        if (params.anchorToStart) {
          params.dates = params.dates.filter(function (dateObj) {
            return !dateObj.isBeforeStart;
          });
        }

        // Do not show dates after end date
        if (params.anchorToEnd) {
          params.dates = params.dates.filter(function (dateObj) {
            return !dateObj.isAfterEnd;
          });
        }

        var allDateObjs = params.dates;

        var onlyUpdateDates = params.dates.map(function (dateObj) {
          return dateObj.date;
        });

        var firstUpdate = moment.min(onlyUpdateDates);
        var lastUpdate = moment.max(onlyUpdateDates);

        allDateObjs.push({
          date: params.startDate,
          isSameAsStart: true,
          isSameAsEnd: isSame(params.startDate, params.endDate),
          isBeforeStart: false,
          isBeforeEnd: true,
          isAfterStart: false,
          isAfterEnd: false,
        });

        allDateObjs.push({
          date: params.endDate,
          isSameAsStart: isSame(params.endDate, params.startDate),
          isSameAsEnd: true,
          isBeforeStart: false,
          isBeforeEnd: false,
          isAfterStart: true,
          isAfterEnd: false,
        });

        var allMomentObjs = allDateObjs.map(function (dateObj) {
          return dateObj.date;
        });

        var minDate = moment.min(allMomentObjs);
        var maxDate = moment.max(allMomentObjs);

        $.each(allDateObjs, function (key, value) {
          allDateObjs[key].percentage = getDatePercentage(allDateObjs[key]);
        });

        var updateDates = allDateObjs;

        updateDates.sort(function(a, b) { 
          return a.percentage - b.percentage;
        });

        console.log('first update on start = '+firstUpdateOnStart);
        console.log('last update on end = '+lastUpdateOnEnd);

        var i = 0;
        $.each(updateDates, function (key, value) {

          var color = 'blank';

          if (i == 0) {

            if (firstUpdateOnStart) {
              color = 'success';
            }

            var progressbar = '<div class="progress-bar progress-bar-'+color+'" style="width: '+updateDates[key + 1].percentage+'%"></div>';
            $(".datebar-steps").append(progressbar);

          } else if (updateDates[key + 1] !== undefined) {

            if (updateDates[key + 1].isAfterEnd) {
              color = 'danger';
            } else if (updateDates[key + 1].isAfterStart) {
              if (lastUpdateOnEnd) {
                color = 'success';
              } else if (updateDates[key + 1].isBeforeEnd) {
                color = 'success';
              } else if (!updateDates[key + 1].date.isSame(params.endDate, 'd')) {
                color = 'success';
              } else if (updateDates[key + 1].date.isAfter(params.endDate, 'd')) {
                color = 'blank';
              } else {
                if (updateDates[key - 1] !== undefined && updateDates[key + 1] !== undefined) {
                  if (lastUpdate.isAfter(params.endDate)) {
                    color = 'success';
                  } else if (updateDates[key + 1].date.isSame(lastUpdate, 'd')) {
                      color = 'success';
                  }
                }
              }
            }

            var percentage = updateDates[key + 1].percentage - updateDates[key].percentage;
            var progressbar = '<div class="progress-bar progress-bar-'+color+'" style="width: '+percentage+'%"></div>';
            $(".datebar-steps").append(progressbar);
          }
          i++;
        });

        allDateObjs.map(function (dateObj) {
          var classes = 'datebar-step';
          if (dateObj.date === params.startDate) {
            classes = 'datebar-step datebar-start';
          }
          if (dateObj.date === params.endDate) {
            classes = 'datebar-step datebar-end';
          }
          var percentage = getDatePercentage(dateObj);
          var step = '<div class="'+classes+'" style="left: '+percentage+'%">' +
            '<div class="datebar-label-date">'+dateObj.date.format('DD/MM')+'</div>' +
            '<div class="datebar-label-percent">'+dateObj.percentage+'%</div>' +
            '</div>';

          $(".datebar-steps").append(step);
        });

      }

      }

    function getDatePercentage(dateObj) {
      return Math.round(((dateObj.date.unix() - minDate.unix()) / (maxDate.unix() - minDate.unix())) * 100);
    }
    
    function isBefore(firstDate, secondDate) {
      return (firstDate.isBefore(secondDate)) ? true : false;
    }

    function isAfter(firstDate, secondDate) {
      return (firstDate.isAfter(secondDate)) ? true : false;
    }

    function isSame(firstDate, secondDate) {
      return (firstDate.isSame(secondDate, 'd')) ? true : false;
    }
  }
}(jQuery));