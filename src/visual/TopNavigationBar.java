package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class TopNavigationBar extends SubElement {
	
	Props header;
	Props title;
	Props child;//tipo button link dropdown

	public TopNavigationBar(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(Text.class);
		List<Class<?>> type3=new ArrayList<Class<?>>();
		type3.add(SubElement.class);
		
		this.header=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.title=new Props(IdGenerator.getNextIdProps(), type2, false, false,1);
		this.child=new Props(IdGenerator.getNextIdProps(), type3, true, true,-1);
		this.props.put("header",header);
		this.props.put("titile",title);
		this.props.put("child",child);
	}

}
