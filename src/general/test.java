package general;

import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import net.sourceforge.yamlbeans.YamlException;
import net.sourceforge.yamlbeans.YamlWriter;
import style.BottomNavigationBarStyle;
import style.TopNavigationBarStyle;
import visual.*;

public class test {

	public static void main(String[] args) throws YamlException {
		
	
		HashMap<String,Element> el=new HashMap<String, Element>();
		
	
		Root r=new Root(IdGenerator.getNextIdElement());
		el.put(r.getId(), r);
		Page p1 = new Page(IdGenerator.getNextIdElement());
		p1.editPropName("url", "https://vivaio40.doriansrl.it/home",null, true);
        p1.editPropName("layout", "home.yml", null, true);
		
		el.put(p1.getId(), p1);

		
	
		r.editPropName("children", p1,p1.getId(), true);

		
		Style po=Operation.createStyle("BottomNavigationBar");
		BottomNavigationBarStyle p=(BottomNavigationBarStyle) po.value;		
		p.alignment="start";
		p.backgroundColor="rgb(254, 254, 254)";
		r.addStyle(po, true);
		
		Style top=Operation.createStyle("TopNavigationBar");
		TopNavigationBarStyle tp=(TopNavigationBarStyle) top.value;
		tp.fixed=true;
		tp.alignment="end";
		tp.backgroundColor="rgb(0, 0, 0)";
		r.addStyle(top, true);
		
		
	
		HashMap<String,Object> prova2=Operation.ricorsiva(r, el);
	    YamlWriter writer=null;
		try {
			writer = new YamlWriter(new FileWriter("output.yml"));
			writer.getConfig().writeConfig.setAutoAnchor(false);
			writer.getConfig().writeConfig.setAlwaysWriteClassname(false);
			
			 writer.write(prova2);
			 
	    writer.close();
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return;
		}
	   
		

	}

}
