"""
Blog submitter

"""
import stomp
import time
import simplejson
import pprint
import urllib2, urllib
import random
import re

feeds = [
    'http://www2a.cdc.gov/podcasts/createrss.asp?c=252'
]

class TwitterSearch(object):
    last_id = None
    term = None

    def __init__(self, term):
        self.term = term

    def fetch(self, limit=1):
        """
        Search
        """
        
        query = dict(q=self.term)
        if self.last_id:
            query['since_id'] = self.last_id
        fh = urllib2.urlopen('http://search.twitter.com/search.json?%s' % urllib.urlencode(query))
        result = simplejson.load(fh)
        
        for r in result['results']:
            max_id = r.get('id',0)
            if self.last_id is None or max_id > self.last_id:
                self.last_id = max_id
        
        return result['results']
        
        
ts = TwitterSearch('#swineflu')
vtect = TwitterSearch('from:veratect OR from:cdcemergency')

conn = stomp.Connection()
conn.start()
conn.connect()

pre_load = dict()

while True:
    for r in ts.fetch():
        if re.search(r'http://', r['text']):
            channel = 'twitter_links'
        else:
            channel = 'twitter'
        
        
        if not pre_load.has_key(channel):
            pre_load[channel] = []
        
        if len(pre_load[channel]) > 15:
            pre_load[channel].pop()
            
        pre_load[channel].insert(0, r)
        
        f = open('%s_load.js' % channel,'w')
        
        simplejson.dump({'%s_load' % channel: pre_load[channel]}, f)
        
        f.close()
        print "Sending new entry: %s" % r['text']
        conn.send(simplejson.dumps(r), destination='/topic/%s' % channel)
            
        time.sleep(1)

    for r in vtect.fetch():
        channel = 'reliable'
        
        
        if not pre_load.has_key(channel):
            pre_load[channel] = []
        
        if len(pre_load[channel]) > 15:
            pre_load[channel].pop()
            
        pre_load[channel].insert(0, r)
        
        f = open('%s_load.js' % channel,'w')
        
        simplejson.dump({'%s_load' % channel: pre_load[channel]}, f)
        
        f.close()
        print "Sending new entry: %s" % r['text']
        conn.send(simplejson.dumps(r), destination='/topic/%s' % channel)
            
        time.sleep(1)
    
    #conn.send(simplejson.dumps(dict(text="Happy test test", from_user="testtwitter", profile_image_url="http://s3.amazonaws.com/twitter_production/profile_images/186623658/hari_normal.jpg")), destination="/topic/twitter")
        
    time.sleep(random.randint(30,60))



"""

conn.send('testing testing', destination='/topic/twitter')
time.sleep(1)
conn.disconnect()

"""